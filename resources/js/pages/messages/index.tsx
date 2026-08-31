import { Head, Link } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { show as showConversation } from '@/routes/messages';
import type { ConversationSummary } from '@/types';

type Props = {
    conversations: ConversationSummary[];
};

export default function MessagesIndex({ conversations }: Props) {
    return (
        <>
            <Head title="Messages" />
            <div className="mx-auto w-full max-w-2xl space-y-4 p-4">
                <h1 className="text-xl font-semibold">Messages</h1>

                {conversations.length === 0 ? (
                    <div className="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
                        No conversations yet.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {conversations.map((conversation) => (
                            <Link
                                key={conversation.id}
                                href={showConversation(conversation.id).url}
                                className="block"
                            >
                                <Card className="hover:bg-accent transition">
                                    <CardContent className="flex items-center gap-3 p-4">
                                        <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
                                            <MessageCircle className="text-muted-foreground size-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {conversation.counterpart
                                                    ?.name ?? 'Unknown'}
                                            </p>
                                            {conversation.listing && (
                                                <p className="text-muted-foreground truncate text-sm">
                                                    {conversation.listing.title}
                                                </p>
                                            )}
                                        </div>
                                        {conversation.unread_count > 0 && (
                                            <Badge>
                                                {conversation.unread_count}
                                            </Badge>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

MessagesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Messages', href: '/messages' },
    ],
};
