import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
  User,
  sendEmailVerification,
} from "firebase/auth";
import { FirebaseApp } from "firebase/app";
import { Firebase } from "~/api/Firebase";

export class AuthenticationService {
  private readonly _app: FirebaseApp;
  private readonly _auth: Auth;
  private readonly _fb: Firebase;
  constructor(fb: Firebase) {
    this._fb = fb;
    this._app = fb.app;
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

  async updateProfile(name: string, profileImage: string) {
    if (!this.user) {
      throw new Error("User is not logged in");
    }

    profileImage = await this._fb.uploadImage(`profile-${name}`, profileImage);

    return await updateProfile(this.user, {
      displayName: name,
      photoURL: profileImage,
    });
  }

  async verifyEmail() {
    if (!this.user) {
      throw new Error("User is not logged in");
    }

    return await sendEmailVerification(this.user);
  }
}
