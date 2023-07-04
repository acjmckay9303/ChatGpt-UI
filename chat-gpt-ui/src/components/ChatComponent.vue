<template>
  <div class="chat-container">
    <div v-if="!selectedConversation">
      <!-- Conversation selection or creation form -->
      <div>
        <h2>Choose or Create a Conversation</h2>
        <select v-model="selectedConversationId">
          <option value="">Select a conversation</option>
          <option v-for="conversation in conversations" :key="conversation.id" :value="conversation.id">
            {{ conversation.id }}
          </option>
        </select>
        <button @click="startNewConversation">Start New Conversation</button>
        <button @click="joinConversation" :disabled="!selectedConversationId">Join Conversation</button>
      </div>
    </div>
    <div v-else>
      <!-- Chat interface -->
      <div class="chat-box">
        <div v-for="(message, index) in selectedConversation.messages" :key="index" :class="['message', message.role]">
          {{ message.content }}
        </div>
      </div>
      <div class="message-input">
        <input v-model="userInput" @keyup.enter="sendUserMessage" placeholder="Type a message..." />
        <button @click="sendUserMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ChatInterface',
  data() {
    return {
      userInput: '',
      selectedConversationId: '',
      selectedConversation: null,
      conversations: [], // Array to store conversations
    };
  },
  mounted() {
    this.fetchConversations();
  },
  methods: {
    async fetchConversations() {
      // Fetch the list of conversations from the backend
      try {
        const response = await axios.get('http://localhost:8081/conversations');
        this.conversations = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    async startNewConversation() {
      // Start a new conversation
      try {
        const response = await axios.post('http://localhost:8081/conversation/start');
        const conversationId = response.data;
        this.selectedConversationId = conversationId;
        this.fetchConversations(); // Update the conversations list
      } catch (error) {
        console.error(error);
      }
    },
    async joinConversation() {
      // Join an existing conversation
      const conversationId = this.selectedConversationId;
      // Fetch the entire conversation from the backend
      try {
        const response = await axios.get(`http://localhost:8081/conversations/${conversationId}`);
        const conversation = response.data;
        // Classify the loaded messages with the appropriate role
        conversation.messages.forEach((message) => {
          if (message.role === 'assistant') {
            message.role = 'assistant';
          } else {
            message.role = 'user';
          }
        });
        this.selectedConversation = conversation;
      } catch (error) {
        console.error(error);
      }
    },
    async sendUserMessage() {
      if (this.userInput && this.selectedConversationId) {
        const message = { role: 'user', content: this.userInput };
        // Get the last 20 messages from the selected conversation
        const last20Messages = this.selectedConversation.messages.slice(-20);
        // Combine the new message with the last 20 messages
        const messages = [...last20Messages, message];
        // Send the messages to the backend along with the conversation ID
        try {
          const gptResponse = await axios.post(`http://localhost:8081/conversation/${this.selectedConversationId}/chat`, messages);
          this.selectedConversation.messages.push(message); // Add the user message
          this.selectedConversation.messages.push({ role: 'assistant', content: gptResponse.data }); // Add the GPT response
        } catch (error) {
          console.error(error);
        }
        this.userInput = '';
      }
    }
  },
};
</script>

<style scoped>
/* Styles remain the same */
</style>



<style scoped>
.chat-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1em;
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.chat-box {
  height: 400px;
  overflow-y: auto;
  padding: 1em;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  margin-bottom: 1em;
}

.message {
  margin-bottom: 0.5em;
  padding: 0.5em;
  border-radius: 5px;
}

.user {
  background-color: #007bff;
  color: #fff;
}

.assistant {
  background-color: #28a745;
  color: #fff;
}

.message-input {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 0.5em;
}

.message-input input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0.5em;
}

.message-input input:focus {
  outline: none;
}

.message-input input::placeholder {
  color: #aaa;
}

.message-input button {
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 0.5em 1em;
  margin-left: 0.5em;
  cursor: pointer;
}

.message-input button:hover {
  background-color: #0056b3;
}
</style>
