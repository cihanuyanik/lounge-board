import { FirebaseApp, initializeApp } from "firebase/app";
import { firebaseConfig } from "~/api/config";
import { getFirestore, Firestore } from "firebase/firestore";
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadString,
  deleteObject,
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
    // this.UpcomingEvents = new UpcomingEventsCollection(this);
    // this.PastEvents = new PastEventsCollection(this);
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

  async uploadImage(readableName: string, base64UrlStr: string) {
    // Check if the image is a base64 string
    if (!base64UrlStr.startsWith("data:image/")) return "";

    // generate a unique path for the image
    const storagePath = `${readableName
      .toLowerCase()
      .replaceAll(" ", "-")}-${Date.now()}`;

    // create a reference to the image
    const imageStoreRef = ref(this._storage, storagePath);

    // upload the image
    const result = await uploadString(imageStoreRef, base64UrlStr, "data_url");

    return `https://firebasestorage.googleapis.com/v0/b/${result.metadata.bucket}/o/${result.metadata.fullPath}?alt=media`;
  }

  async deleteImage(url: string) {
    if (url && url.startsWith("http")) {
      const imageRef = ref(this._storage, url);
      return deleteObject(imageRef);
    }
  }
}
