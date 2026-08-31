<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Listing;
use App\Models\Message;
use App\Notifications\NewMessageNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    /**
     * All threads the user takes part in, as buyer or as shop owner.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $shopId = $user->shop?->id;

        $conversations = Conversation::query()
            ->where(fn ($query) => $query
                ->where('buyer_id', $user->id)
                ->when($shopId, fn ($q) => $q->orWhere('shop_id', $shopId)))
            ->with(['shop:id,name,slug,owner_id', 'shop.owner:id,name', 'buyer:id,name', 'listing:id,title'])
            ->withCount(['messages as unread_count' => fn ($query) => $query
                ->whereNull('read_at')
                ->where('sender_id', '!=', $user->id)])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(fn (Conversation $conversation) => [
                'id' => $conversation->id,
                'listing' => $conversation->listing,
                'counterpart' => $conversation->counterpartFor($user)?->only('id', 'name'),
                'unread_count' => $conversation->unread_count,
                'last_message_at' => $conversation->last_message_at,
            ]);

        return Inertia::render('messages/index', [
            'conversations' => $conversations,
        ]);
    }

    /**
     * A single thread. Viewing it marks the other party's messages as read.
     */
    public function show(Request $request, Conversation $conversation): Response
    {
        $this->authorize('view', $conversation);

        $conversation->messages()
            ->whereNull('read_at')
            ->where('sender_id', '!=', $request->user()->id)
            ->update(['read_at' => now()]);

        $conversation->load([
            'shop:id,name,slug,owner_id',
            'buyer:id,name',
            'listing:id,title,slug',
            'messages.sender:id,name',
        ]);

        return Inertia::render('messages/show', [
            'conversation' => [
                'id' => $conversation->id,
                'shop' => $conversation->shop->only('id', 'name', 'slug'),
                'listing' => $conversation->listing,
                'counterpart' => $conversation->counterpartFor($request->user())?->only('id', 'name'),
                'messages' => $conversation->messages->map(fn (Message $message) => [
                    'id' => $message->id,
                    'body' => $message->body,
                    'sender_id' => $message->sender_id,
                    'sender_name' => $message->sender->name,
                    'created_at' => $message->created_at,
                ]),
            ],
        ]);
    }

    /**
     * Start (or continue) a thread with a shop about one of its listings.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'listing_id' => ['required', 'integer', 'exists:listings,id'],
            'body' => ['required', 'string', 'max:2000'],
        ]);

        /** @var Listing $listing */
        $listing = Listing::with('shop')->findOrFail($data['listing_id']);

        if ($listing->shop->owner_id === $request->user()->id) {
            throw ValidationException::withMessages(['body' => 'You cannot message your own shop.']);
        }

        $conversation = Conversation::firstOrCreate([
            'buyer_id' => $request->user()->id,
            'shop_id' => $listing->shop_id,
            'listing_id' => $listing->id,
        ]);

        $this->postMessage($conversation, $request->user()->id, $data['body']);

        return to_route('messages.show', $conversation);
    }

    /**
     * Post a reply to an existing thread.
     */
    public function reply(Request $request, Conversation $conversation): RedirectResponse
    {
        $this->authorize('reply', $conversation);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $this->postMessage($conversation, $request->user()->id, $data['body']);

        return back();
    }

    /**
     * Persist a message, bump the thread, and notify the counterpart.
     */
    private function postMessage(Conversation $conversation, int $senderId, string $body): Message
    {
        $conversation->loadMissing('buyer', 'shop.owner');

        $message = $conversation->messages()->create([
            'sender_id' => $senderId,
            'body' => $body,
        ]);

        $conversation->update(['last_message_at' => $message->created_at]);

        $sender = $conversation->buyer_id === $senderId
            ? $conversation->buyer
            : $conversation->shop->owner;

        $conversation->counterpartFor($sender)?->notify(new NewMessageNotification($message));

        return $message;
    }
}
