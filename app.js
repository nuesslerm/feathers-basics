const feathers = require('@feathersjs/feathers');
const app = feathers();
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

// register the message service on the feathers application
app.use('messages', new MessageService());

// log every time a new message has been created
app
  .service('messages')
  .on('created', (message) =>
    console.log('A new message has been created', message)
  );

app.service('messages').on('removed', (removedMessage) => {
  console.log('Removed message', removedMessage);
  console.log('Remaining messages', app.service('messages').messages);
});

// a function that creates new messages and then logs all existing messages
const main = async (number) => {
  // create a new message on our message service
  for (let i = 0; i < number; i++) {
    await app.service('messages').create({
      text: `what's up ${faker.name.firstName()}`,
    });
  }

  await app.service('messages').remove(0);

  // find all existing messages
  const messages = await app.service('messages').find();

  console.log('All messages', messages);
};

main(100);
