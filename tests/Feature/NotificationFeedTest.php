<?php

use App\Models\Conversation;
use App\Models\Listing;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use App\Notifications\OutbidNotification;

/**
 * Persist a database notification for the given user and return its id.
 */
function notifyUser(User $user): string
{
    $message = Message::factory()->for(Conversation::factory())->create();
    $user->notify(new NewMessageNotification($message));

    return $user->notifications()->first()->id;
}

test('the notifications index returns the users notifications', function () {
    $user = User::factory()->create();
    notifyUser($user);

    $this->actingAs($user)->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('notifications', 1));
});

test('a user can mark a single notification as read', function () {
    $user = User::factory()->create();
    $id = notifyUser($user);

    $this->actingAs($user)->patch(route('notifications.read', $id))->assertRedirect();

    expect($user->unreadNotifications()->count())->toBe(0);
});

test('a user can mark all notifications as read', function () {
    $user = User::factory()->create();
    notifyUser($user);
    notifyUser($user);

    $this->actingAs($user)->patch(route('notifications.read-all'))->assertRedirect();

    expect($user->unreadNotifications()->count())->toBe(0);
});

test('the unread notification count is shared with the frontend', function () {
    $user = User::factory()->create();
    notifyUser($user);

    $this->actingAs($user)->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page->where('auth.notifications.unread', 1));
});

test('transactional notifications are also sent by email', function () {
    $listing = Listing::factory()->create();
    $notification = new OutbidNotification($listing, 5000);

    expect($notification->via(User::factory()->make()))->toContain('mail');
});

test('unverified users cannot access the authenticated app', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)->get(route('orders.index'))->assertRedirect();
});
