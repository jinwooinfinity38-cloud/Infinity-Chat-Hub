# Security Specification - TKC Chat App

## Data Invariants
1. **Identity Integrity**: A user can only create and modify their own profile.
2. **Bot Profiles**: Bot profiles (like 'bot-jin-uid') are managed by the system. For development, any authenticated user can "seed" them if they don't exist, but we should strictly validate their shape.
3. **Message Authenticity**: Messages must be sent by the authenticated user, EXCEPT for bot responses which are simulated client-side. To allow Jin's responses, users can post as 'bot-jin-uid' if the message is in a room.
4. **Relational Sync**: Messages must belong to an existing room.
5. **PII Isolation**: Users can only read their own private notifications and private messages.

## The "Dirty Dozen" Payloads

1. **Identity Spoofing (Write)**: Attempting to create a user profile with a different UID.
   - `setDoc(doc(db, 'users', 'other-user'), { uid: 'other-user', displayName: 'Hacker' })`
2. **Identity Spoofing (Update)**: Attempting to change an existing user's `uid`.
3. **Privilege Escalation**: Attempting to set `role: 'admin'` on own profile.
4. **Shadow Field Injection**: Adding an `isVerified: true` field to a user profile to bypass future checks.
5. **Orphaned Message**: Creating a message in a non-existent room (enforced via `exists()`).
6. **Impersonation**: Creating a message with `senderId` of another real user.
7. **Bot Spoofing (Invalid Shape)**: Creating a bot user with missing required fields or incorrect types.
8. **Private Message Snoop**: Reading `privateMessages` where the user is neither sender nor receiver.
9. **Terminal State Break**: Attempting to update a game session after its status is `finished`.
10. **Notification Spam**: Attempting to create notifications for other users.
11. **Resource Poisoning**: Sending a 1MB string in the `text` field of a message.
12. **Query Scraping**: Attempting to list all users without filtering for current room (except for bots).

## Test Runner (Draft)
A `firestore.rules.test.ts` file will be generated to verify these cases.

## Mitigation Strategy
1. **isValidId** helper for all document IDs.
2. **isValidUser**, **isValidMessage**, etc. helpers that use `affectedKeys().hasOnly()` or strict schema checks.
3. **isAdmin** check based on email verification for the developer email.
4. **isBotId** helper to allow simulated bot activity.
