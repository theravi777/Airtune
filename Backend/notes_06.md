1. why password hashing is needed ...

Why Plain Text Storage Fails
Data Breaches: If an attacker steals a database containing plain text passwords, every user's account across all services where they reuse that password is instantly compromised. Hashing ensures that stolen data is unusable on its own.

Insider Threats: Database administrators, developers, or anyone with internal access would be able to read all user passwords without hashing.

Network & Log Exposure: Plain text passwords can accidentally end up in system logs, backup files, or monitoring tools where unauthorized eyes can view them.


2. What is Hashing?

Hashing is the process of taking an input of any size (such as a string, a file, or a password) and passing it through a mathematical function—a hash function—to produce a unique, fixed-length string of characters called a hash value or digest.

Key Characteristics:

Fixed Output Size: Whether the input is a single character or a 100 GB file, the resulting hash string is always the exact same length (e.g., 254 bits for SHA-256).
Deterministic: Passing the exact same input through a hash function will always produce the exact same output hash
One-Way (Irreversible): You cannot back-calculate or reverse the original input from the output hash alone.
Avalanche Effect: Changing even a single character or space in the input completely alters the generated hash output.


4. 

Middleware (Express.js)

Definition (2–3 lines):
Middleware is a function that runs between receiving a request and sending a response in an Express application. It can access the request (req), response (res), and the next() function to pass control to the next middleware.

Short note for exams:
Middleware is a function that executes before the route handler. It can process requests, modify req/res, perform authentication, logging, validation, error handling, and either send a response or pass control to the next middleware using next().