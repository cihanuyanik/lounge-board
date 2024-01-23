import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { FirebaseApp } from "firebase/app";

export class AuthenticationService {
  private readonly _app: FirebaseApp;
  private readonly _auth: Auth;
  constructor(app: FirebaseApp) {
    this._app = app;
    this._auth = getAuth(this._app);
    if (!this._auth) {
      throw new Error("Firebase Authentication cannot be initialized");
    }
  }

  get auth(): Auth {
    return this._auth;
  }

  get user(): User | null {
    return this._auth.currentUser;
  }

  async signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(this._auth, email, password);
  }

  async signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this._auth, email, password);
  }

  async signOut() {
    return await this._auth.signOut();
  }
}
