import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, SendHorizontal } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { show as showListing } from '@/routes/listings';
import { index as messagesIndex, reply } from '@/routes/messages';
import type { ConversationDetail } from '@/types';

type Props = {
    conversation: ConversationDetail;
};

export default function MessageThread({ conversation }: Props) {
    const { auth } = usePage().props;
    const bottomRef = useRef<HTMLDivElement>(null);
    const { data, setData, post, processing, reset } = useForm({ body: '' });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation.messages.length]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(reply(conversation.id).url, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title={conversation.counterpart?.name ?? 'Conversation'} />
            <div className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-2xl flex-col p-4">
                {/* Header */}
                <div className="flex items-center gap-3 border-b pb-3">
                    <Button asChild size="icon" variant="ghost">
                        <Link href={messagesIndex().url}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div className="min-w-0">
                        <p className="truncate font-medium">
                            {conversation.counterpart?.name ?? 'Unknown'}
                        </p>
                        {conversation.listing && (
                            <Link
                                href={showListing(conversation.listing.id).url}
                                className="text-muted-foreground truncate text-sm hover:underline"
                            >
                                {conversation.listing.title}
                            </Link>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-2 overflow-y-auto py-4">
                    {conversation.messages.map((message) => {
                        const mine = message.sender_id === auth.user.id;
                        return (
                            <div
                                key={message.id}
                                className={cn(
                                    'flex',
                                    mine ? 'justify-end' : 'justify-start',
                                )}
                            >
                                <div
                                    className={cn(
                                        'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
                                        mine
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted',
                                    )}
                                >
                                    {message.body}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Composer */}
                <form
                    onSubmit={submit}
                    className="flex items-end gap-2 border-t pt-3"
                >
                    <Textarea
                        rows={1}
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                submit(e);
                            }
                        }}
                        placeholder="Write a message…"
                        className="min-h-10 flex-1 resize-none"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={processing || data.body.trim() === ''}
                    >
                        <SendHorizontal className="size-4" />
                    </Button>
                </form>
            </div>
        </>
    );
}

MessageThread.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Messages', href: messagesIndex().url },
    ],
};
