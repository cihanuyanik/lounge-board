import { FirebaseApp, initializeApp } from "firebase/app";
import { firebaseConfig } from "~/api/config";
import { Firestore, getFirestore } from "firebase/firestore";
import {
  deleteObject,
  FirebaseStorage,
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from "firebase/storage";
import NewsCollection from "~/api/NewsCollection";
import ResearchGroupsCollection from "~/api/ResearchGroupsCollection";
import MembersCollection from "~/api/MembersCollection";
import MetaCollection from "~/api/MetaCollection";
import { AuthenticationService } from "~/api/AuthenticationService";
import EventsCollection from "~/api/EventsCollection";

export class Firebase {
  private readonly _app: FirebaseApp;
  private readonly _db: Firestore;
  private readonly _storage: FirebaseStorage;
  public AuthService: AuthenticationService;
  public News: NewsCollection;
  public Events: EventsCollection;
  public ResearchGroups: ResearchGroupsCollection;
  public Members: MembersCollection;
  public Meta: MetaCollection;

  constructor() {
    this._app = initializeApp(firebaseConfig);
    if (!this._app) {
      throw new Error("Firebase Application cannot be initialized");
    }

    this._db = getFirestore(this._app);
    if (!this._db) {
      throw new Error("Firebase Database cannot be initialized");
    }

    this._storage = getStorage(
      this._app,
      `gs://${firebaseConfig.storageBucket}`,
    );

    if (!this._storage) {
      throw new Error("Firebase Storage cannot be initialized");
    }

    this.News = new NewsCollection(this);
    this.Events = new EventsCollection(this);
    this.ResearchGroups = new ResearchGroupsCollection(this);
    this.Members = new MembersCollection(this);
    this.Meta = new MetaCollection(this);
    this.AuthService = new AuthenticationService(this);
  }

  get app() {
    return this._app;
  }

  get db() {
    return this._db;
  }

  generateStoragePath(readableName: string, addTimeStampToUrl = true) {
    // generate a unique path for the image
    let storagePath = readableName.toLowerCase().replaceAll(" ", "-");
    if (addTimeStampToUrl) {
      storagePath += `-${Date.now()}`;
    }

    return storagePath;
  }

  async uploadImage(
    readableName: string,
    base64UrlStr: string,
    addTimeStampToUrl = true,
  ) {
    // Check if the image is a base64 string
    if (!base64UrlStr.startsWith("data:image/")) return "";

    // generate a unique path for the image
    const storagePath = this.generateStoragePath(
      readableName,
      addTimeStampToUrl,
    );

    // create a reference to the image
    const imageStoreRef = ref(this._storage, storagePath);

    // upload the image
    const result = await uploadString(imageStoreRef, base64UrlStr, "data_url");

    return `https://firebasestorage.googleapis.com/v0/b/${result.metadata.bucket}/o/${encodeURIComponent(result.metadata.fullPath)}?alt=media`;
  }

  async deleteImage(url: string) {
    if (url && url.startsWith("http")) {
      try {
        const imageRef = ref(this._storage, url);
        await deleteObject(imageRef);
      } catch (e) {
        // Just try to delete it, no need to throw an error if it fails
      }
    }
  }

  // Get the download URL
  async getDownloadURL(storagePath: string) {
    try {
      const imageRef = ref(this._storage, storagePath);
      return await getDownloadURL(imageRef);
    } catch (e) {
      return null;
    }
  }
}
