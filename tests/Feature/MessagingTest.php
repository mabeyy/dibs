<?php

use App\Models\Conversation;
use App\Models\Listing;
use App\Models\Message;
use App\Models\Shop;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use Illuminate\Support\Facades\Notification;

/**
 * @return array{0: User, 1: Shop, 2: Listing}
 */
function shopWithListing(): array
{
    $seller = User::factory()->create();
    $shop = Shop::factory()->verified()->for($seller, 'owner')->create();
    $listing = Listing::factory()->for($shop)->create();

    return [$seller, $shop, $listing];
}

test('a buyer can start a conversation about a listing', function () {
    Notification::fake();
    [$seller, $shop, $listing] = shopWithListing();
    $buyer = User::factory()->create();

    $this->actingAs($buyer)->post(route('messages.store'), [
        'listing_id' => $listing->id,
        'body' => 'Is this still available?',
    ])->assertRedirect();

    $conversation = Conversation::sole();
    expect($conversation->buyer_id)->toBe($buyer->id)
        ->and($conversation->shop_id)->toBe($shop->id)
        ->and($conversation->messages()->count())->toBe(1);

    Notification::assertSentTo($seller, NewMessageNotification::class);
});

test('a seller cannot message their own shop', function () {
    [$seller, , $listing] = shopWithListing();

    $this->actingAs($seller)->post(route('messages.store'), [
        'listing_id' => $listing->id,
        'body' => 'Talking to myself',
    ])->assertSessionHasErrors('body');

    expect(Conversation::count())->toBe(0);
});

test('messaging the same listing reuses the existing thread', function () {
    [, , $listing] = shopWithListing();
    $buyer = User::factory()->create();

    $this->actingAs($buyer)->post(route('messages.store'), [
        'listing_id' => $listing->id,
        'body' => 'First question',
    ])->assertRedirect();

    $this->actingAs($buyer)->post(route('messages.store'), [
        'listing_id' => $listing->id,
        'body' => 'Second question',
    ])->assertRedirect();

    expect(Conversation::count())->toBe(1)
        ->and(Message::count())->toBe(2);
});

test('the seller can reply and it notifies the buyer', function () {
    Notification::fake();
    [$seller, $shop, $listing] = shopWithListing();
    $buyer = User::factory()->create();
    $conversation = Conversation::factory()->create([
        'buyer_id' => $buyer->id,
        'shop_id' => $shop->id,
        'listing_id' => $listing->id,
    ]);

    $this->actingAs($seller)->post(route('messages.reply', $conversation), [
        'body' => 'Yes, it is available!',
    ])->assertRedirect();

    expect($conversation->messages()->count())->toBe(1);
    Notification::assertSentTo($buyer, NewMessageNotification::class);
});

test('a non-participant cannot view a conversation', function () {
    [, $shop, $listing] = shopWithListing();
    $conversation = Conversation::factory()->create([
        'shop_id' => $shop->id,
        'listing_id' => $listing->id,
    ]);

    $this->actingAs(User::factory()->create())
        ->get(route('messages.show', $conversation))
        ->assertForbidden();
});

test('viewing a conversation marks the other partys messages as read', function () {
    [$seller, $shop, $listing] = shopWithListing();
    $buyer = User::factory()->create();
    $conversation = Conversation::factory()->create([
        'buyer_id' => $buyer->id,
        'shop_id' => $shop->id,
        'listing_id' => $listing->id,
    ]);
    $message = Message::factory()->create([
        'conversation_id' => $conversation->id,
        'sender_id' => $buyer->id,
    ]);

    $this->actingAs($seller)->get(route('messages.show', $conversation))->assertOk();

    expect($message->refresh()->read_at)->not->toBeNull();
});

test('the messages index lists a users threads', function () {
    [$seller, $shop, $listing] = shopWithListing();
    $buyer = User::factory()->create();
    Conversation::factory()->create([
        'buyer_id' => $buyer->id,
        'shop_id' => $shop->id,
        'listing_id' => $listing->id,
    ]);

    $this->actingAs($seller)->get(route('messages.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('messages/index')->has('conversations', 1));
});
