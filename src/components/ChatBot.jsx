import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, Send, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const WEBHOOK_URL = "https://n8n-excollo.azurewebsites.net/webhook/dora-dori-chatbot";

// Component to format chat messages with headers, lists, etc.
const FormattedMessage = ({ content }) => {
  if (!content) return null;

  const formattedElements = [];
  let currentListItems = [];
  let listKey = null;

  // Split by lines
  const lines = content.split('\n');

  const flushList = () => {
    if (currentListItems.length > 0) {
      formattedElements.push(
        <ul key={listKey} className="list-disc list-inside space-y-1 sm:space-y-1.5 my-1.5 sm:my-2 ml-2 sm:ml-3">
          {currentListItems.map((item, idx) => (
            <li key={idx} className="text-xs sm:text-sm leading-relaxed">{item}</li>
          ))}
        </ul>
      );
      currentListItems = [];
      listKey = null;
    }
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    // Check if line has format: "Header text: - item1 - item2 - item3"
    // This handles the case where a header ends with colon followed by inline list items
    if (trimmed.includes(':') && trimmed.includes(' - ')) {
      const colonIndex = trimmed.indexOf(':');
      const beforeColon = trimmed.substring(0, colonIndex).trim();
      const afterColon = trimmed.substring(colonIndex + 1).trim();

      // Check if after colon starts with list items
      if (afterColon.match(/^-\s+/)) {
        flushList();
        // Add header
        formattedElements.push(
          <h4 key={`header-${lineIndex}`} className="font-bold text-xs sm:text-sm mt-2 sm:mt-3 mb-1.5 sm:mb-2 first:mt-0 text-foreground">
            {beforeColon}
          </h4>
        );

        // Extract list items (split by " - ")
        const listItems = afterColon.split(/\s+-\s+/).map(item => item.trim()).filter(Boolean);

        if (listItems.length > 0) {
          formattedElements.push(
            <ul key={`list-${lineIndex}`} className="list-disc list-inside space-y-1 sm:space-y-1.5 my-1.5 sm:my-2 ml-2 sm:ml-3">
              {listItems.map((item, idx) => (
                <li key={idx} className="text-xs sm:text-sm leading-relaxed">{item}</li>
              ))}
            </ul>
          );
        }
        return;
      }
    }

    // Check if line is a standalone header (ends with colon, not too long, doesn't start with list marker)
    const isHeader = trimmed.endsWith(':') &&
      trimmed.length < 150 &&
      !trimmed.startsWith('-') &&
      !trimmed.match(/^[-*•]\s/) &&
      !trimmed.includes(' - ');

    // Check if line is a list item (starts with -, *, •, or number)
    const isListItem = /^[-*•]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed);

    if (isHeader) {
      flushList();
      const headerText = trimmed.replace(/:\s*$/, '');
      formattedElements.push(
        <h4 key={`header-${lineIndex}`} className="font-bold text-xs sm:text-sm mt-2 sm:mt-3 mb-1.5 sm:mb-2 first:mt-0 text-foreground">
          {headerText}
        </h4>
      );
    } else if (isListItem) {
      // Group consecutive list items
      const listItem = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, '').trim();
      if (listItem) {
        if (listKey === null) {
          listKey = `list-${lineIndex}`;
        }
        currentListItems.push(listItem);
      }
    } else {
      flushList();
      // Regular paragraph
      formattedElements.push(
        <p key={`para-${lineIndex}`} className="text-xs sm:text-sm mb-1.5 sm:mb-2 leading-relaxed">
          {trimmed}
        </p>
      );
    }
  });

  // Flush any remaining list
  flushList();

  // If no formatting was applied, return original content
  if (formattedElements.length === 0) {
    return <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{content}</p>;
  }

  return <div className="space-y-1">{formattedElements}</div>;
};

const ChatBot = ({ isOpen: controlledIsOpen, onOpenChange, onClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof controlledIsOpen === "boolean";
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi, I'm Dora — your inventory analyst. What would you like to know today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const chatPanelRef = useRef(null);
  const messagesEndRef = useRef(null);
  const buttonRef = useRef(null);

  const quickReplies = [
    "Show low stock on Myntra",
    "Fabric status report",
    "High return SKUs this week",
    "Which sizes are broken?",
  ];

  const setOpenState = useCallback(
    (nextState) => {
      const resolvedState = typeof nextState === "function" ? nextState(isOpen) : nextState;

      if (!isControlled) {
        setInternalIsOpen(resolvedState);
      }

      if (onOpenChange) {
        onOpenChange(resolvedState);
      }

      if (resolvedState === false && onClose) {
        onClose();
      }
    },
    [isControlled, isOpen, onClose, onOpenChange],
  );

  const handleClose = useCallback(() => setOpenState(false), [setOpenState]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close chatbot on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatPanelRef.current &&
        !chatPanelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClose, isOpen]);

  const callWebhook = async (userMessage) => {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      // Get response text first (can only read body once)
      const responseText = await response.text();

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`, responseText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        // If not JSON, use text directly
        return responseText.trim() || "No response received.";
      }

      // Handle different response structures
      // If data is an array, take first element
      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      }

      // Try multiple possible response keys
      const reply =
        data?.reply ||
        data?.output ||
        data?.response ||
        data?.text ||
        data?.message ||
        data?.answer ||
        (typeof data === 'string' ? data : null) ||
        (typeof data === 'object' && data !== null ? JSON.stringify(data) : null) ||
        "No response received.";

      return reply;
    } catch (error) {
      // Handle network errors separately
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error("Network error - CORS or connection issue:", error);
        throw new Error("Unable to connect to the chatbot service. Please check your internet connection.");
      }

      console.error("Webhook error details:", {
        error: error.message,
        url: WEBHOOK_URL,
        message: userMessage,
      });
      throw error;
    }
  };

  const handleSend = async (messageToSend = null) => {
    const userMessage = (messageToSend || message).trim();
    if (!userMessage || isLoading) return;

    if (!hasInteracted) {
      setHasInteracted(true);
    }

    // Add user message to chat history
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setMessage("");
    setIsLoading(true);

    // Add loading message
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "...",
        isLoading: true,
      },
    ]);

    try {
      const reply = await callWebhook(userMessage);

      // Remove loading message and add actual response
      setMessages((prev) => {
        const withoutLoading = prev.filter((msg) => !msg.isLoading);
        return [
          ...withoutLoading,
          {
            role: "assistant",
            content: reply,
          },
        ];
      });
    } catch (error) {
      // Remove loading message and add error message
      setMessages((prev) => {
        const withoutLoading = prev.filter((msg) => !msg.isLoading);
        return [
          ...withoutLoading,
          {
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        ref={buttonRef}
        onClick={() => setOpenState((prev) => !prev)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:scale-110 transition-transform bg-primary z-50"
        size="icon"
      >
        {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <Card ref={chatPanelRef} className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[70vh] shadow-2xl border-2 flex flex-col z-40">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-primary to-accent flex items-center gap-2 flex-shrink-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm sm:text-base">Inventory Analyst</h3>
              <p className="text-[10px] sm:text-xs text-white/80 truncate">
                Ask about stock, fabric, or ads
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-secondary/30 min-h-0">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 ${msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border shadow-sm"
                    }`}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      <p className="text-xs sm:text-sm">Thinking...</p>
                    </div>
                  ) : msg.role === "assistant" ? (
                    <FormattedMessage content={msg.content} />
                  ) : (
                    <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {!hasInteracted && (
            <div className="p-2 sm:p-3 border-t bg-card space-y-2 flex-shrink-0">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {quickReplies.map((reply, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent transition-colors text-[10px] sm:text-xs px-2 py-1"
                    onClick={() => {
                      handleSend(reply);
                    }}
                  >
                    {reply}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 sm:p-4 border-t bg-card flex-shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 text-sm h-9 sm:h-10"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSend()}
                size="icon"
                className="bg-primary h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                disabled={isLoading || !message.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatBot;


