import { Search, Plus, Settings, LogOut } from "lucide-react";

const ConversationSidebar = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewChat,
  searchQuery,
  onSearchChange,
  sidebarOpen,
  onToggleSidebar,
  currentUser,
  onRefresh,
}) => {
  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => onToggleSidebar()}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 w-72 bg-white text-gray-900 flex flex-col z-40 transition-transform duration-300 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } border-r border-gray-200`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
                ⚖️
              </div>
              <span className="font-semibold text-lg text-gray-900">
                Legal Assistant
              </span>
            </div>
            <button
              onClick={() => onToggleSidebar()}
              className="lg:hidden p-1 bg-gray-100 border border-gray-200 hover:bg-red-500 rounded-lg transition-colors transition-transform hover:scale-105"
            >
              <svg
                className="w-5 h-5 text-gray-600 hover:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Conversations
            </h3>

            {conversations.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-500 text-sm">No conversations yet</p>
                <p className="text-gray-400 text-xs mt-2">
                  Start a new chat to begin
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onRefresh?.();
                      onToggleSidebar();
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors relative group ${
                      activeConversation === conv.id
                        ? "bg-red-600 text-white"
                        : "text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300 hover:border-red-400"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                          activeConversation === conv.id
                            ? "bg-white/20"
                            : "bg-gray-200 group-hover:bg-gray-300"
                        }`}
                      >
                        {conv.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {conv.title}
                        </p>
                        <p
                          className={`text-xs ${
                            activeConversation === conv.id
                              ? "text-white/70"
                              : "text-gray-500"
                          } truncate`}
                        >
                          {conv.category}
                        </p>
                      </div>
                      {conv.unread > 0 && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-semibold">
                          {conv.unread}
                        </div>
                      )}
                    </div>

                    {/* Hover actions */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div
                        className="p-1 hover:bg-gray-300 rounded transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ConversationSidebar;
