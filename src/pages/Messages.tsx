
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { User } from "@/types";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Messages = () => {
  const { currentUser } = useAuth();
  const { getUserMessages, getMessagesBetweenUsers, mockUsers = [], addMessage } = useData();
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  if (!currentUser) return null;

  // Get all messages for the current user
  const userMessages = getUserMessages(currentUser.id);
  
  // Get unique contacts (users who have exchanged messages with the current user)
  const contacts = [...new Map(
    userMessages.map(msg => {
      const contactId = msg.senderId === currentUser.id ? msg.recipientId : msg.senderId;
      const user = mockUsers?.find(u => u.id === contactId);
      return [contactId, user];
    })
  ).values()].filter(Boolean) as User[];
  
  // If no selected contact but we have contacts, select the first one
  if (!selectedContact && contacts.length > 0 && !selectedContact) {
    setSelectedContact(contacts[0]);
  }
  
  // Get messages between current user and selected contact
  const conversation = selectedContact 
    ? getMessagesBetweenUsers(currentUser.id, selectedContact.id) 
    : [];

  const handleSendMessage = () => {
    if (!selectedContact || !newMessage.trim()) return;
    
    addMessage({
      senderId: currentUser.id,
      recipientId: selectedContact.id,
      content: newMessage,
    });
    
    setNewMessage("");
    
    toast({
      title: "Message sent",
      description: "Your message has been delivered",
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold tracking-tight mb-6">Messages</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Contacts List */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-medium">Contacts</h3>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-60px)]">
            {contacts.length > 0 ? (
              <div className="divide-y">
                {contacts.map(contact => {
                  const unreadCount = userMessages.filter(
                    msg => msg.senderId === contact.id && !msg.isRead
                  ).length;

                  return (
                    <div
                      key={contact.id}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedContact?.id === contact.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <Avatar className="h-9 w-9">
                        {contact.avatarUrl ? (
                          <img 
                            src={contact.avatarUrl} 
                            alt={contact.name} 
                            className="rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {contact.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{contact.name}</p>
                          {unreadCount > 0 && (
                            <span className="h-5 w-5 rounded-full bg-architect text-[10px] font-medium text-white flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">
                          {contact.role}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground p-4">
                No conversations yet
              </p>
            )}
          </div>
        </div>

        {/* Conversation Area */}
        <div className="md:col-span-2 border rounded-lg flex flex-col">
          {selectedContact ? (
            <>
              <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  {selectedContact.avatarUrl ? (
                    <img 
                      src={selectedContact.avatarUrl} 
                      alt={selectedContact.name} 
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {selectedContact.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedContact.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{selectedContact.role}</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversation.length > 0 ? (
                  conversation.map((message) => {
                    const isCurrentUser = message.senderId === currentUser.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isCurrentUser
                              ? "bg-architect text-white"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-[10px] mt-1 opacity-70">
                            {new Date(message.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </p>
                )}
              </div>
              
              <div className="p-4 border-t">
                <form 
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-muted-foreground">
                Select a contact to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
