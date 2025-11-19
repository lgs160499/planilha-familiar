import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { MonthData } from "../types";
import { INITIAL_DATA } from "../constants";

// --- CONFIGURAÇÃO DO FIREBASE ---
// VOCÊ DEVE SUBSTITUIR ESTE OBJETO PELAS SUAS CHAVES DO CONSOLE DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCktCv-WA58ZqH3zhTcybYxE5wCKR0ANZQ",
  authDomain: "familia-financeiro.firebaseapp.com",
  projectId: "familia-financeiro",
  storageBucket: "familia-financeiro.firebasestorage.app",
  messagingSenderId: "279888605900",
  appId: "1:279888605900:web:1b5d4fc61381e8cc6ec869",
  measurementId: "G-D52YX6F151"
};

// Inicializa apenas se não houver apps já inicializados (evita erro em hot reload)
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (e) {
    // Caso a config esteja vazia ou inválida, capturamos o erro para não quebrar a build inicial
    console.warn("Firebase não configurado corretamente. Verifique o arquivo services/firebase.ts");
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// --- MÉTODOS DE AUTENTICAÇÃO ---

export const loginUser = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase não configurado.");
    return signInWithEmailAndPassword(auth, email, pass);
};

export const logoutUser = async () => {
    if (!auth) return;
    return signOut(auth);
};

// --- MÉTODOS DE DADOS (FIRESTORE) ---

// Nome da coleção onde os dados da família ficarão salvos
// Usaremos um documento único chamado 'financeData' dentro da coleção 'families'
// O ID do documento será o UID do usuário (ou um ID compartilhado se preferir lógica de grupos)
export const subscribeToFinanceData = (uid: string, onDataChange: (data: MonthData[]) => void) => {
    if (!db) return () => {};

    // Para simplificar o compartilhamento entre marido e esposa, neste exemplo
    // vamos assumir que ambos usam a mesma conta de login OU que salvamos
    // os dados em um documento fixo 'family_main' se você quiser compartilhar entre contas diferentes.
    // Por segurança padrão, vamos usar o UID do usuário logado.
    
    // Se vocês usarem o mesmo email/senha, isso funciona perfeitamente para sincronizar.
    const docRef = doc(db, "users", uid);

    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data().months as MonthData[];
            onDataChange(data);
        } else {
            // Se o documento não existe (primeiro login), cria com os dados iniciais
            await setDoc(docRef, { months: INITIAL_DATA });
            onDataChange(INITIAL_DATA);
        }
    });

    return unsubscribe;
};

export const saveFinanceData = async (uid: string, data: MonthData[]) => {
    if (!db) return;
    const docRef = doc(db, "users", uid);
    // Sobrescreve o array com a nova versão. 
    // O Firestore é inteligente o suficiente para enviar apenas deltas em muitos casos, 
    // mas para arrays complexos ele reescreve. Para esse volume de dados é perfeitamente aceitável.
    await setDoc(docRef, { months: data }, { merge: true });
};
