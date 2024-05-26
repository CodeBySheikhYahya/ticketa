#! /usr/bin/env node
import inquirer from "inquirer";

// Define User and Event interfaces
         interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    isAdmin: boolean;
}

  interface Event {
    id: string;
    eventType: string;
    title: string;
    date: string;
    day: string;
    time: string;
    city: string;
    ticketStock: number;
}

interface Purchase {
    eventId: string;
    userId: string;
    quantity: number;
}



const users: User[] = [
    { id: '1', name: 'Default Admin', email: '123@1', password: '123', isAdmin: true } // Default admin user
];

      const events: Event[] = [];

   const purchases: Purchase[] = [];

// Function to generate unique IDs


function generateId(): string {
    return Math.random().toString(36).substr(2, 9);
}

// Function to display the welcome message
 function displayWelcomeMessage() {
    console.log('Welcome to the Online Ticketing System CLI!');

    console.log('This system allows you to browse events and purchase tickets conveniently.');
}

// Function to handle user signup
async function signup() {
    const userData = await inquirer.prompt([
        {
  type: 'input',
 name: 'name',
     message: 'Enter your name:'
        },
        {
            type: 'input',
            name: 'email',
            message: 'Enter your email:'
        },
        {
            type: 'password',
            name: 'password',
   message: 'Enter your password:'
        }
    ]);

    const user = { id: generateId(), ...userData, isAdmin: false };

    users.push(user);

    console.log('Signup successful!');
}
// Function to handle user login
async function login() {

    const { email, password } = await inquirer.prompt([
        {
            type: 'input',
            name: 'email',
            message: 'Enter your email:'
        },
        {
            type: 'password',
            name: 'password',
            message: 'Enter your password:'
        }
    ]);

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {

        console.log(`Welcome back, ${user.name}!`);
        if (user.isAdmin) {
            await adminMenu();
        } else {
            await userMenu(user);
        }
    }
     else {
        console.log('Invalid email or password. Please try again.');
        await login();
    }
}


// Function to display admin menu and handle admin actions
async function adminMenu() {
    const { choice } = await inquirer.prompt({
        type: 'list',
        name: 'choice',
        message: 'Admin Menu. Please choose an option:',
        choices: [
            'Create Event',
            'List Events',
            'Logout'
        ]
    });

    switch (choice) {
        case 'Create Event':
            await createEvent();
            break;
        case 'List Events':
            await listEvents();
            break;
        case 'Logout':
            console.log('Logged out successfully.');
            await mainMenu();
            return;
    }
    await adminMenu();
}

// Function to display user menu and handle user actions
async function userMenu(user: User) {
    const { choice } = await inquirer.prompt({
        type: 'list',
        name: 'choice',
        message: 'User Menu. Please choose an option:',
        choices: [
            'Browse Events',
            'Purchase Tickets',
            'View Purchase History',
            'Logout'
        ]
    });

    switch (choice) 
    {
        case 'Browse Events':
            await listEvents();
            break;
        case 'Purchase Tickets':
            await purchaseTickets(user);
            break;
        case 'View Purchase History':
            await viewPurchaseHistory(user);
            break;
        case 'Logout':
            console.log('Logged out successfully.');
            await mainMenu();
            return;
    }

    await userMenu(user);
}

// Function to handle event creation by admin
async function createEvent() {
    const eventData = await inquirer.prompt([
        {
            type: 'list',
            name: 'eventType',
            message: 'Select event type:',
            choices: [
                'Music Concert',
                'Sports Event',
                'Theater Play'
            ]
        },
        {
            type: 'input',
            name: 'title',
            message: 'Enter event title:'
        },
        {
            type: 'input',
            name: 'date',
            message: 'Enter event date (YYYY-MM-DD):',
            validate: (input) => {
                const date = new Date(input);
                return date > new Date() ? true : 'Please enter a future date.';
            }
        },
        {
            type: 'input',
            name: 'day',
            message: 'Enter event day:'
        },
        {
            type: 'input',
            name: 'time',
            message: 'Enter event time (HH:MM in 24-hour format):',
            validate: (input) => {
                const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
                return timePattern.test(input) ? true : 'Please enter a valid time in 24-hour format (HH:MM).';
            }
        },
        {
            type: 'input',
            name: 'city',
            message: 'Enter event city:'
        },
        {
            type: 'number',
            name: 'ticketStock',
            message: 'Enter available ticket stock:'
        }
    ]);

    const event = { id: generateId(), ...eventData };
    events.push(event);
    console.log('Event created successfully!');
}

// Function to list all events
async function listEvents() {
    if (events.length === 0) {
        console.log('No events available.');
    } else {
        console.log('Available Events:');
        events.forEach(event => {
            console.log(`${event.eventType} - ${event.title} on ${event.day}, ${event.date} at ${event.time} in ${event.city} (${event.ticketStock} tickets available)`);
        });
    }
}

// Function to handle ticket purchase by user
async function purchaseTickets(user: User) {
    if (events.length === 0) {
        console.log('No events available.');
        return;
    }

    const { eventId } = await inquirer.prompt({
        type: 'list',
        name: 'eventId',
        message: 'Select an event to purchase tickets:',
        choices: [
            { name: 'Go back', value: 'back' },
            ...events.map(event => ({
                name: `${event.eventType} - ${event.title} on ${event.day}, ${event.date} at ${event.time} in ${event.city} (${event.ticketStock} tickets available)`,
                value: event.id
            }))
        ]
    });

    if (eventId === 'back') {
        return;
    }

    const event = events.find(e => e.id === eventId);

    if (!event) {
        console.log('Event not found.');
        return;
    }

    const { quantity } = await inquirer.prompt({
        type: 'number',
        name: 'quantity',
        message: `Enter number of tickets to purchase (Available: ${event.ticketStock}):`,
        validate: (input) => input > 0 && input <= event.ticketStock ? true : `Please enter a number between 1 and ${event.ticketStock}.`
    });

    const { cardNumber } = await inquirer.prompt({
        type: 'input',
        name: 'cardNumber',
        message: 'Enter your card payment number:',
        validate: (input) => input.length === 16 ? true : 'Please enter a valid 16-digit card number.'
    });

    const { confirm } = await inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: `You are about to purchase ${quantity} tickets for ${event.title}. Do you want to proceed?`
    });

    if (confirm) {
        event.ticketStock -= quantity;
        const purchase = { eventId: event.id, userId: user.id, quantity };
        purchases.push(purchase);
        console.log('Tickets purchased successfully!');
    } else {
        console.log('Purchase cancelled.');
    }
}

// Function to view user's purchase history
async function viewPurchaseHistory(user: User) {
    const userPurchases = purchases.filter(p => p.userId === user.id);

    if (userPurchases.length === 0) {
        console.log('No purchase history found.');
    } else {
        console.log('Your Purchase History:');
        userPurchases.forEach(purchase => {
            const event = events.find(e => e.id === purchase.eventId);
            if (event) {
                console.log(`${purchase.quantity} tickets for ${event.title} on ${event.day}, ${event.date} at ${event.time} in ${event.city}`);
            }
        });
    }
}

// Function to display the main menu and handle user navigation
async function mainMenu() {
    const { choice } = await inquirer.prompt({
        type: 'list',
        name: 'choice',
        message: 'Main Menu. Please choose an option:',
        choices: [
            'Signup',
            'Login',
            'Exit'
        ]
    });

    switch (choice) {
        case 'Signup':
            await signup();
            break;
        case 'Login':
            await login();
            break;
        case 'Exit':
            console.log('Thank you for using the Online Ticketing System CLI. Goodbye!');
            process.exit(0);
    }
    await mainMenu();
}

// Function to start the application
async function startApp() {
    await displayWelcomeMessage();
    await mainMenu();
}

startApp();
