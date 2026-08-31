<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    /**
     * Only the two participants (buyer and shop owner) may view a thread.
     */
    public function view(User $user, Conversation $conversation): bool
    {
        return $conversation->includesParticipant($user);
    }

    /**
     * Either participant may post a reply.
     */
    public function reply(User $user, Conversation $conversation): bool
    {
        return $conversation->includesParticipant($user);
    }
}
