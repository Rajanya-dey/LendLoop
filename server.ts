import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. RESTful API Routes for LendLoop Ledger Protocol
  let mockLoans = [
    {
      id: "LL-29402",
      borrowerName: "Sarah Jenkins",
      title: "Modern Office Expansion",
      category: "Business",
      amountRequired: 12500,
      amountFunded: 5000,
      interestRate: 11.2,
      status: "PENDING_APPROVAL",
    },
    {
      id: "LL-10583",
      borrowerName: "Marcus Thorne",
      title: "Sustainable Farming Gear",
      category: "Home",
      amountRequired: 12000,
      amountFunded: 12000,
      interestRate: 8.5,
      status: "REPAYMENT_DUE",
    }
  ];

  // GET all loans (RESTful principles /api/loans)
  app.get("/api/loans", (req, res) => {
    res.json({ success: true, count: mockLoans.length, data: mockLoans });
  });

  // GET a single loan by ID (RESTful principles /api/loans/:id)
  app.get("/api/loans/:id", (req, res) => {
    const loan = mockLoans.find((l) => l.id === req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, error: "Loan resource not found" });
    }
    res.json({ success: true, data: loan });
  });

  // POST create a new loan (RESTful principles /api/loans)
  app.post("/api/loans", (req, res) => {
    const { title, category, amountRequired, interestRate, borrowerName } = req.body;
    if (!title || !amountRequired) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const newLoan = {
      id: "LL-" + Math.floor(10000 + Math.random() * 90000),
      borrowerName: borrowerName || "Anonymous Borrower",
      title,
      category: category || "Other",
      amountRequired: Number(amountRequired),
      amountFunded: 0,
      interestRate: Number(interestRate || 8.5),
      status: "PENDING_APPROVAL",
    };

    mockLoans.unshift(newLoan);
    res.status(201).json({ success: true, data: newLoan });
  });

  // MongoDB connection placeholder representation
  app.get("/api/db/status", (req, res) => {
    res.json({
      primaryDB: "Firebase Firestore Cloud (Enterprise Multi-Region Sync Ready)",
      sandboxDB: "MongoDB Sandbox Protocol (Inactive / Fallback Active)",
      status: "Connected & Synced",
      ruleCompliance: "ABAC Version 2 Citadel Guards Checked",
    });
  });

  // 2. Vite Dev Middleware configuration vs static client serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LendLoop fullstack server running on http://localhost:${PORT}`);
  });
}

startServer();
