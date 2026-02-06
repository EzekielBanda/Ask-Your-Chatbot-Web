import Message from "./Message";

const MessageGroup = ({ date, messages, currentUser, onFileView }) => {
  console.log("🔄 Rendering messages for date group:", date);

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 flex justify-center">
        <div className="text-xs text-gray-700 bg-gray-100 rounded-full w-[90px] p-1 text-center">
          {date}
        </div>
      </div>

      {messages.map((message) => {
        const reply = message.reply;

        console.log("💬 Message:", message.id, "Text:", message.text);

        return (
          <div key={message.id} className="space-y-1">
            {/* Render main message with reply data */}
            <Message
              message={message}
              currentUser={currentUser}
              reply={reply?.text === "seen" ? "seen" : null}
              onFileView={onFileView}
            />

            {/* Render reply bubble if reply is NOT "seen" */}
            {reply && reply.text !== "seen" && (
              <Message
                message={reply}
                currentUser={currentUser}
                isReply={true}
                replyType="bubble"
                onFileView={onFileView}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageGroup;
