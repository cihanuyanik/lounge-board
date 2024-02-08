import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
  WriteBatch,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { Firebase } from "~/api/Firebase";

export default class Collection<
  T extends { id: string; createdAt: Timestamp },
> {
  protected readonly _name: string;
  protected readonly _fb: Firebase;
  protected readonly _db: Firestore;

  protected _batch: WriteBatch | undefined = undefined;
  constructor(name: string, fb: Firebase) {
    this._name = name;
    this._fb = fb;
    this._db = fb.db;
  }

  get collection() {
    return collection(this._db, this._name);
  }

  subscribe(dataChangedCB?: (data: T[]) => void) {
    return onSnapshot(this.collection, (snapshot) => {
      const data = [] as T[];

      snapshot.forEach((doc) => {
        data.push(doc.data() as T);
      });

      if (dataChangedCB) {
        dataChangedCB(data);
      }
    });
  }

  beginTransaction(batch?: WriteBatch) {
    // if there is already a batch, return
    if (this._batch) return;

    // if there is a batch passed in, use that one
    if (batch) {
      this._batch = batch;
    } else {
      // otherwise, create a new batch
      this._batch = writeBatch(this._db);
    }
  }

  async commitTransaction() {
    // if there is no batch, return
    if (!this._batch) return;

    // commit the batch
    await this._batch.commit();

    // clear the batch
    this._batch = undefined;
  }

  get batch() {
    return this._batch;
  }

  set batch(batch: WriteBatch | undefined) {
    this._batch = batch;
  }

  async add(data: Omit<T, "id" | "createdAt">): Promise<string> {
    try {
      // Generate a new document id
      const dataWithId = data as T;

      // If the data does not have an id or empty string, generate a new one
      if (!dataWithId.id || dataWithId.id === "") dataWithId.id = uuid();

      // if the data does not have a createdAt field, generate a new one
      if (!dataWithId.createdAt) dataWithId.createdAt = Timestamp.now();

      // Add a new document with a generated id.
      const docRef = doc(this._db, this._name, dataWithId.id);

      // Set the data of the document
      if (this._batch) {
        this._batch.set(docRef, data);
      } else {
        await setDoc(docRef, data);
      }

      // Return the id of the document
      return dataWithId.id;
    } catch (e) {
      throw e;
    }
  }

  async update(data: { original: T; changes: Partial<T> }): Promise<void> {
    try {
      // Access the document in the collection with the id
      const docRef = doc(this._db, this._name, data.original.id);

      // Update the data of the document
      if (this._batch) {
        this._batch.update(docRef, data.changes as DocumentData);
      } else {
        await updateDoc(docRef, data.changes as DocumentData);
      }
    } catch (e) {
      throw e;
    }
  }

  async delete(data: T | string): Promise<void> {
    try {
      // if data is just a string, use it as the id
      const id = typeof data === "string" ? data : data.id;

      // Access the document in the collection with the id
      const docRef = doc(this._db, this._name, id);

      if (this._batch) {
        this._batch.delete(docRef);
      } else {
        await deleteDoc(docRef);
      }
    } catch (e) {
      throw e;
    }
  }
}
