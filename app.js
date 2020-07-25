const feathers = require('@feathersjs/feathers');
// const app = feathers();
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

const faker = require('faker');

class MessageService {
  constructor() {
    this.messages = [];
  }

  async find() {
    // return all your messages
    return this.messages;
  }

  async create(data) {
    // new message is data merged with a unique identifier
    // using the messages length since it changes whenever we add one
    const message = {
      id: this.messages.length,
      text: data.text,
    };

    // add new message to the list
    this.messages.push(message);

    return message;
  }

  async remove(id) {
    const removedMessage = this.messages.splice(id, 1);
    this.messages.map((message) => {
      if (message.id > id) message.id -= 1;
    });

    return removedMessage;
  }
}

//----------------------------------------------------------------

// creates an ExpressJS compatible Feathers application
const app = express(feathers());

// Parse HTTP JSON bodies
app.use(express.json());
// Parse URL-encoded params
app.use(express.urlencoded({ extended: true }));
// Host static files from the current folder
app.use(express.static(__dirname));
// Add REST API support
app.configure(express.rest());
// Configure Socket.io real-time APIs
app.configure(socketio());
// Register an in-memory messages service
app.use('/messages', new MessageService());
// Register a nicer error handler than the default Express one
app.use(express.errorHandler());

// Add any new real-time connection to the `everybody` channel
app.on('connection', (connection) => app.channel('everybody').join(connection));
// Publish all events to the `everybody` channel
app.publish((data) => app.channel('everybody'));

// Start the server
app
  .listen(3030)
  .on('listening', () =>
    console.log('Feathers server listening on localhost:3030')
  );

// Register the message service on the Feathers application
// app.use('messages', new MessageService());

// log every time a new message has been created
// app
//   .service('messages')
//   .on('created', (message) =>
//     console.log('A new message has been created', message)
//   );

// app.service('messages').on('removed', (removedMessage) => {
//   console.log('Removed message', removedMessage);
//   console.log('Remaining messages', app.service('messages').messages);
// });

// a function that creates new messages and then logs all existing messages
const main = async (number) => {
  // create a new message on our message service
  for (let i = 0; i < number; i++) {
    app.service('messages').create({
      text: `what's up ${faker.name.firstName()}`,
    });
  }

  app.service('messages').remove(0);

  // find all existing messages
  // const messages = await app.service('messages').find();
  app.service('messages').find();

  // console.log('All messages', messages);
};

// main(3);

// For good measure let's create a message
// So our API doesn't look so empty
app.service('messages').create({
  text: 'Hello world from the server',
});
