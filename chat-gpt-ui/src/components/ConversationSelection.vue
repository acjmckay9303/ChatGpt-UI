<template>
  <div>
    <div v-if="!join && !create">
      <h2>Choose to join or Create a Conversation</h2>
      <button @click="selectStartConversation">Start New Conversation</button>
      <button @click="selectJoinConversation">Join Conversation</button>
    </div>

    <div v-else-if="join">
      <div>
        <h2>Select a Conversation</h2>
        <select v-model="selectedConversationId">
          <option value="">Select a conversation</option>
          <option v-for="conversation in conversations" :key="conversation.id" :value="conversation.id">
            {{ conversation.id }}
          </option>
        </select>
        <button @click="joinConversation" :disabled="!selectedConversationId">Join Conversation</button>
      </div>
    </div>

    <div v-else-if="create">
      <div>
        <h2>Create a Conversation</h2>
        <button @click="startNewConversation" :disabled="!conversationName">Start New Conversation</button>
        <input v-model="conversationName" placeholder="Enter conversation name"/>
      </div>
    </div>
  </div>
</template>

<script>
import { makeAuthRequest } from '../security/tokenUtils';
import router  from "@/router";
export default {
  name: 'ConversationSelection',
  data() {
    return {
      selectedConversationId: null,
      join: false,
      create: false,
      conversationName: '',
      conversations: [],
    };
  },
  mounted() {
    this.fetchConversations();
  },
  methods: {
    async fetchConversations() {
      try {
        const response = await this.makeRequest(
            'get',
            'http://localhost:8081/secure/conversation'
        );
        console.log(response);
        this.conversations = response?.data;
      } catch (error) {
        console.error(error);
      }
    },

    async selectJoinConversation() {
      this.join = true;
    },

    async selectStartConversation() {
      this.join = false;
      this.create = true;
    },

    async startNewConversation() {
      try {
        // Create a new conversation object with the provided name
        const newConversation = {
          name: this.conversationName
        };

        // Send a POST request to the /create endpoint with the new conversation
        const response = await this.makeRequest(
            'post',
            'http://localhost:8081/secure/conversation/create',
            newConversation
        );

        const conversationId = response.data.id; // Retrieve the conversation ID
        this.selectedConversationId = conversationId;

        // Update the conversations list
        await this.fetchConversations();

        // Clear the input field
        this.conversationName = '';

        // Now you can start chatting
        this.create = false;
        this.join = true;

      } catch (error) {
        console.error(error);
      }
    },

    async joinConversation() {
        await router.push({ name: 'ChatInterface', params: { conversationId: this.selectedConversationId } });
    },

    async makeRequest(method, url, data, params) {
      try {
        const response = await makeAuthRequest(method, url, data, params);
        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
</script>

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
