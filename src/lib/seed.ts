import { db } from './firebase';
import { collection, getDocs, addDoc, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export async function seedChatBot() {
  const botUid = 'bot-jin-uid';
  const botRef = doc(db, 'users', botUid);
  
  // Create a data URL for the 🎭 emoji
  const emojiSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><text y='.9em' font-size='80'>🎭</text></svg>`;
  const emojiDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(emojiSvg)}`;

  await setDoc(botRef, {
    uid: botUid,
    displayName: 'Jin',
    photoURL: emojiDataUrl,
    bio: 'Always online, always listening. Mention my name to chat! 🧪🌀',
    role: 'bot',
    isBot: true,
    xp: 0,
    level: 100,
    rubies: 999999,
    crystals: 999999,
    tokens: 999999,
    rank: 'OS',
    createdAt: serverTimestamp(),
    lastActive: serverTimestamp(),
    currentRoomId: '' // Will show up globally online if handled in panel
  }, { merge: true }).catch(err => {
    console.error('Failed to seed bot:', botUid, 'Error:', err);
  });
  
  console.log('Seeded/Updated Jin Bot');
}

export async function seedInitialRooms() {
  const roomsRef = collection(db, 'rooms');
  const snapshot = await getDocs(roomsRef);
  
  if (snapshot.empty) {
    const initialRooms = [
      { name: 'Infinity Room', description: "Welcome to Infinity Chat! 🌀💬 We're glad you're here🫂. This is a chill place to talk, vibe, and make new friends and also learn new fun things 😎🤝", category: 'General', isPrivate: false, isPinned: true },
      { name: 'Quiz Room', description: 'Test your brain, challenge friends, and learn something new every day. Win bragging rights! 🤓', category: 'Games', isPrivate: false, isPinned: true },
      { name: 'Staff room', description: 'And of course, Staff need their private meetings too 🤫', category: 'Staff', isPrivate: true, isPinned: true },
      { name: 'Depression room', description: 'A quiet place for heavy hearts, lost in their own thoughts...', category: 'Support', isPrivate: false },
      { name: 'Art room', description: 'Till art do us part🎨👨‍🎨 ft(Rain and Mal)', category: 'Art', isPrivate: false },
      { name: 'Any Language Room', description: 'Learn new languages as you teach your own.💕💞💕💞', category: 'Education', isPrivate: false },
      { name: 'Complaint Room', description: 'You can complain in this room. Staff members are requested to check this room time to time . 👍', category: 'Support', isPrivate: false },
    ];

    for (const room of initialRooms) {
      await addDoc(roomsRef, {
        ...room,
        createdAt: serverTimestamp(),
        createdBy: 'system'
      });
    }
    console.log('Seeded initial rooms');
  }
}
