require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Transaction = require("./models/Transaction");
const { predict } = require("./ml/fraudModel");

(async () => {
  await connectDB();
  await User.deleteMany({});
  await Transaction.deleteMany({});

  const passwordHash = await User.hashPassword("demo1234");
  const user = await User.create({
    name: "Demo User",
    email: "demo@example.com",
    passwordHash,
    homeLat: 40.7128,
    homeLng: -74.006,
  });

  const categories = ["grocery", "electronics", "travel", "gambling", "atm", "online", "other"];
  const merchants = ["Amazon", "Stripe", "Whole Foods", "Best Buy", "Vegas Palace", "Terminal-7", "Shell Gas", "Starbucks", "International ATM", "Netflix"];
  
  console.log("Generating 60 transactions for a fully populated dashboard...");
  
  const history = [];
  for (let i = 0; i < 60; i++) {
    // Generate some fraud (higher amounts, gambling/atm, night time, far from home)
    const isFraudulentSample = i < 15; 
    const tx = {
      merchant: isFraudulentSample ? merchants[Math.floor(Math.random() * 3) + 4] : merchants[Math.floor(Math.random() * 4)],
      category: isFraudulentSample ? (Math.random() > 0.5 ? "gambling" : "atm") : categories[Math.floor(Math.random() * 3)],
      amount: isFraudulentSample ? 2000 + Math.random() * 5000 : 15 + Math.random() * 200,
      lat: isFraudulentSample ? 40.7128 + (Math.random() - 0.5) * 20 : 40.7128 + (Math.random() - 0.5) * 0.2,
      lng: isFraudulentSample ? -74.006 + (Math.random() - 0.5) * 20 : -74.006 + (Math.random() - 0.5) * 0.2,
      isOnline: isFraudulentSample ? true : Math.random() > 0.8,
      timestamp: new Date(Date.now() - (i * 2 * 3600 * 1000)), // Every 2 hours
    };

    const r = predict(tx, user, history);
    const saved = await Transaction.create({
      ...tx, 
      user: user._id,
      fraudScore: r.score, 
      isFraud: r.isFraud, 
      featureContribs: r.contributions,
    });
    history.unshift(saved.toObject());
  }

  console.log("Seeding Database Successful.");
  console.log("Access Credentials: demo@example.com / demo1234");
  process.exit(0);
})();
