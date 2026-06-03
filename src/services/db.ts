import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  getDocFromServer
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { Loan, LoanStatus, Transaction, UserProfile, UserRole } from "../types";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on init
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firestore connection test completed.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration: client appears offline.");
    }
  }
}

// Default initial profiles and data in case the DB is empty
const INITIAL_DEMO_LOANS: Loan[] = [
  {
    id: "LL-29402",
    borrowerId: "sarah_jenkins_sme",
    borrowerName: "Sarah Jenkins",
    borrowerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAReQh5JQb-TgxIWY4eB7rhsea7GErIdgI9KHoPNKsgn5aedK_vpzZk46uIzAa5xpa78GYOm2Dh-RLZUzJrt_YCxo1dqzTfrdj8hBsqVhkZlOSaaRUjmJjuJSXp_Q8kOUSPdBDHjthBjot9nxXFAzClJYOzIWVCRWlZ9AhoQ8XsI_IObYaHeUPbMPapqOrwLVf5Kk4KGV-Sa4kuu5A49tv29PmditMXpqAWH4DZW1mEPvFcwoAs9tKKiHoq7XQiykj7xbwDXousnPOl",
    title: "Modern Office Expansion",
    category: "Business",
    description: "An expansion of our regional bakery workspace so we can house advanced baking technologies and new ovens.",
    amountRequired: 12500,
    amountFunded: 5000,
    interestRate: 11.2,
    tenureMonths: 12,
    status: LoanStatus.PENDING,
    rating: "A+",
    endsAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "LL-10583",
    borrowerId: "marcus_thorne_agri",
    borrowerName: "Marcus Thorne",
    borrowerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2p_ektimh-xUKZAXIyGZqMv7dJEs0Nnfc6uWvicV7tJuToh8zKHPceJKQwPq4IUGfdQgXkDL7frWIuyJ_BkUNg-KMcOMQ-j_i7dIxs_6o--1zp2YOmSQJchxiHTaeyLKYy8hgTrGxCmbobPr5gQZz43s6jtAH-fwQCxYsXaKxV07PYL5Gkxu36bHySmTIRd9WGTMPF4u2YV4y7mObNizw8leymTSfQxnVb4FY4jlHEDAZSk9K25b8fqAXjVSb-N__UJhv56Qql-pj",
    title: "Sustainable Farming Gear",
    category: "Home",
    description: "Eco-friendly micro-sprinklers and smart solar pump integrations to improve the overall farm yield and efficiency.",
    amountRequired: 12000,
    amountFunded: 12000,
    interestRate: 8.5,
    tenureMonths: 24,
    status: LoanStatus.FUNDED,
    rating: "A",
    endsAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: "LL-43891",
    borrowerId: "elena_vance_retail",
    borrowerName: "Elena Vance",
    borrowerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCe0q2U9wkitmhfBu2SPgasdzU5GILubTVE8EDfIYlRhSVk_W13Zan5sz5opMYRsKWt6spqvsscE1n9YoYMNy5bsVpVp14yiCTgXaNT99RlDdaIzae-rBJvQyntlcVUF2QpKpUsLW9XLIJWnCRREHxoHhMkZY6PjxNJ_M-CX6gw8j1_HtEuBMDCZfe9Kgr7kg0nE7U6djE9N8FdKHR7oxyhDE9bSZ1Nj4ZYZ8UN8C5-XLgWrwzDa_UDQ6xj86Fro-y71hhrrUv2p_oi",
    title: "Inventory Restock Q3",
    category: "Consolidation",
    description: "Funding support to acquire materials for high-volume autumn deliveries.",
    amountRequired: 5000,
    amountFunded: 2500,
    interestRate: 12.0,
    tenureMonths: 36,
    status: LoanStatus.PENDING,
    rating: "B+",
    endsAt: new Date(Date.now() + 86400000 * 12).toISOString(),
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    userId: "demo_user",
    loanId: "LL-29402",
    loanTitle: "Home Improvement Loan",
    amount: 450.00,
    type: "repayment",
    date: "2026-05-12T08:00:00Z",
  },
  {
    id: "tx-2",
    userId: "demo_user",
    loanId: "LL-29402",
    loanTitle: "Loan Disbursement - LL-29402",
    amount: 25000.00,
    type: "disbursement",
    date: "2026-04-30T09:12:00Z",
  },
  {
    id: "tx-3",
    userId: "demo_user",
    loanId: "LL-10583",
    loanTitle: "Repayment - LL-10583",
    amount: 795.50,
    type: "repayment",
    date: "2026-04-12T14:22:00Z",
  }
];

// Local Storage Handlers for offline or fallback demo mode
function getLocalStorageData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setLocalStorageData<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Local Storage Error: ", e);
  }
}

// ---------------- USER SERVICE ----------------

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    // If Firebase connection fails, fallback to local storage
    console.warn("Firebase User fetch failed, returning fallback from localStorage.");
    const fallbackProfiles = getLocalStorageData<UserProfile[]>("lendloop_profiles", []);
    const found = fallbackProfiles.find((p) => p.uid === uid);
    if (found) return found;

    // Create a default initial user profile if not found anywhere
    const defaultProfile: UserProfile = {
      uid,
      name: "Alex Rivers",
      email: auth.currentUser?.email || "alex.rivers@lendloop.com",
      role: UserRole.LENDER,
      isVerified: true,
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeqVBVXVEfQ9eCsfto6iKeAqKQUtKaVXKRYg4jX8qHmR-hma28Tlb3q2sbLM8TtUiibcrUgDTcc5i_JhDfbL8W4nk-SiAsYQQpQOfr-sMTJQ4RTHksx3e773vg0SXepVKK49KsYUReSbNX1kXamHdq_y0QrxaDZ7d909EIMjATJ5QuIPDObWMaJaVK9IgzfEXNk1qj2o-o4N0v7to1gFRXyOufcPggnXSLmdPo_9G3hxaomWlAxyQ5uCdeuzujpGJMfNQNugWdeH7T",
      creditScore: 782,
      availableCapital: 14250.00,
    };
    return defaultProfile;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    const docRef = doc(db, "users", profile.uid);
    await setDoc(docRef, profile, { merge: true });
  } catch (error) {
    console.warn("Failed to save user profile to Firebase. Storing in local storage fallback.");
    const fallbackProfiles = getLocalStorageData<UserProfile[]>("lendloop_profiles", []);
    const filtered = fallbackProfiles.filter((p) => p.uid !== profile.uid);
    filtered.push(profile);
    setLocalStorageData("lendloop_profiles", filtered);
  }
}

// ---------------- LOAN SERVICES ----------------

export function subscribeToLoans(callback: (loans: Loan[]) => void): () => void {
  const path = "loans";
  try {
    const q = query(collection(db, "loans"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loans: Loan[] = [];
        snapshot.forEach((doc) => {
          loans.push({ id: doc.id, ...doc.data() } as Loan);
        });
        if (loans.length === 0) {
          // If Firestore is empty, seed it with initial constants
          INITIAL_DEMO_LOANS.forEach(async (l) => {
            await setDoc(doc(db, "loans", l.id), l);
          });
          callback(INITIAL_DEMO_LOANS);
        } else {
          callback(loans);
        }
      },
      (error) => {
        // Fallback onSnapshot error
        console.warn("onSnapshot failed for loans, using local state fallback.");
        const localLoans = getLocalStorageData<Loan[]>("lendloop_loans", INITIAL_DEMO_LOANS);
        callback(localLoans);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn("Direct subscription for loans failed, using polling / localStorage fallback.");
    const localLoans = getLocalStorageData<Loan[]>("lendloop_loans", INITIAL_DEMO_LOANS);
    callback(localLoans);
    return () => {};
  }
}

export async function createLoan(loan: Omit<Loan, "id" | "createdAt" | "endsAt" | "amountFunded" | "rating">): Promise<Loan> {
  const path = "loans";
  const randomId = "LL-" + Math.floor(10000 + Math.random() * 90000);
  const ratingChoices: Loan["rating"][] = ["A+", "A", "B+", "B", "C"];
  const randomRating = ratingChoices[Math.floor(Math.random() * ratingChoices.length)];

  const newLoan: Loan = {
    ...loan,
    id: randomId,
    amountFunded: 0,
    rating: randomRating,
    endsAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, "loans", randomId), newLoan);
    return newLoan;
  } catch (error) {
    console.warn("Creating loan in Firestore failed, using local storage fallback.");
    const localLoans = getLocalStorageData<Loan[]>("lendloop_loans", INITIAL_DEMO_LOANS);
    localLoans.unshift(newLoan);
    setLocalStorageData("lendloop_loans", localLoans);
    return newLoan;
  }
}

export async function fundLoan(loanId: string, lenderId: string, amount: number): Promise<void> {
  try {
    const docRef = doc(db, "loans", loanId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentData = docSnap.data() as Loan;
      const updatedAmount = Math.min(currentData.amountRequired, currentData.amountFunded + amount);
      const isCompleted = updatedAmount >= currentData.amountRequired;

      await updateDoc(docRef, {
        amountFunded: updatedAmount,
        status: isCompleted ? LoanStatus.COMPLETED : currentData.status,
      } as Partial<Loan>);

      // Add a success transaction
      await recordTransaction({
        userId: lenderId,
        loanId: loanId,
        loanTitle: currentData.title,
        amount: amount,
        type: "funding",
      });
    } else {
      throw new Error("Loan not found in database.");
    }
  } catch (error) {
    console.warn("Direct fund loan failed, updating local storage state...");
    const localLoans = getLocalStorageData<Loan[]>("lendloop_loans", INITIAL_DEMO_LOANS);
    const index = localLoans.findIndex((l) => l.id === loanId);
    if (index >= 0) {
      const loan = localLoans[index];
      const updatedFunded = Math.min(loan.amountRequired, loan.amountFunded + amount);
      loan.amountFunded = updatedFunded;
      if (updatedFunded >= loan.amountRequired) {
        loan.status = LoanStatus.COMPLETED;
      }
      localLoans[index] = loan;
      setLocalStorageData("lendloop_loans", localLoans);

      // Save transaction locally
      await recordTransaction({
        userId: lenderId,
        loanId: loanId,
        loanTitle: loan.title,
        amount: amount,
        type: "funding",
      });
    }
  }
}

// ---------------- TRANSACTION SERVICES ----------------

export function subscribeToTransactions(userId: string, callback: (txs: Transaction[]) => void): () => void {
  try {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const txs: Transaction[] = [];
        snapshot.forEach((doc) => {
          txs.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        if (txs.length === 0) {
          callback(INITIAL_DEMO_TRANSACTIONS);
        } else {
          callback(txs);
        }
      },
      (error) => {
        console.warn("onSnapshot failed for transactions, fallback to localStorage.");
        const localTxs = getLocalStorageData<Transaction[]>("lendloop_transactions", INITIAL_DEMO_TRANSACTIONS);
        callback(localTxs.filter((t) => t.userId === userId || userId === "demo_user"));
      }
    );
    return unsubscribe;
  } catch (error) {
    const localTxs = getLocalStorageData<Transaction[]>("lendloop_transactions", INITIAL_DEMO_TRANSACTIONS);
    callback(localTxs.filter((t) => t.userId === userId || userId === "demo_user"));
    return () => {};
  }
}

export async function recordTransaction(tx: Omit<Transaction, "id" | "date">): Promise<Transaction> {
  const randomId = "tx-" + Math.floor(Math.random() * 1000000);
  const newTx: Transaction = {
    ...tx,
    id: randomId,
    date: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, "transactions", randomId), newTx);
    return newTx;
  } catch (error) {
    console.warn("Failed saving transaction to Firestore, appending to LocalStorage.");
    const localTxs = getLocalStorageData<Transaction[]>("lendloop_transactions", INITIAL_DEMO_TRANSACTIONS);
    localTxs.unshift(newTx);
    setLocalStorageData("lendloop_transactions", localTxs);
    return newTx;
  }
}
