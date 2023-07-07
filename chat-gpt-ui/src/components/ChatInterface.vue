<template>
  <div v-if="selectedConversation">
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
</template>

<script>
import { makeAuthRequest } from '../security/tokenUtils';

// Rest of the component code


export default {
  name: 'ChatInterface',
  data() {
    return {
      userInput: '',
      selectedConversation: null,
      conversationId: null,
    };
  },
  mounted() {
    this.fetchConversations();
  },
  methods: {
    async fetchConversations() {
        this.conversationId = this.$route.params.conversationId; // Access the conversation ID from the route parameters
        try {
          const response = await this.makeRequest(
              'get',
              `http://localhost:8081/secure/conversation/${this.conversationId}`
          );
          const conversation = response.data;
          conversation.messages.forEach((message) => {
            if (message.role === 'assistant') {
              message.role = 'assistant';
            } else {
              message.role = 'user';
            }
          });
          this.selectedConversation = conversation; // Update selectedConversation with the retrieved conversation data
      } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 403) {
          await this.refreshToken();
          await this.fetchConversations();
        }
      }
    },

    async sendUserMessage() {
      if (this.userInput && this.conversationId) {
        const message = { role: 'user', content: this.userInput };
        // Get the last 20 messages from the selected conversation
        const last20Messages = this.selectedConversation.messages.slice(-20);
        // Combine the new message with the last 20 messages
        const messages = [...last20Messages, message];
        // Send the messages to the backend along with the conversation ID
        try {
          const gptResponse = await makeAuthRequest(
              'post',
              `http://localhost:8081/secure/gpt/chat`,
              messages,
              {conversationId: this.conversationId}
          );

          console.log(gptResponse);

          if (this.selectedConversation.messages) {
            this.selectedConversation.messages.push(message); // Add the user message
            if (gptResponse && gptResponse.data) { // Check if gptResponse and gptResponse.data are defined
              this.selectedConversation.messages.push({
                role: 'assistant',
                content: gptResponse.data,
              }); // Add the GPT response
            }
          }
        } catch (error) {
          console.error(error);
          if (error.response && error.response.status === 403) {
            // Token expired, refresh the token
            try {
              await this.refreshToken();
              // Retry sending the user message
            } catch (refreshError) {
              console.error(refreshError);
            }
          }
        }
        this.userInput = '';
      }
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
