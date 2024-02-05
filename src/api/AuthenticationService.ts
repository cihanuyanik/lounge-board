import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
  User,
  sendEmailVerification,
  GoogleAuthProvider,
  OAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { FirebaseApp } from "firebase/app";
import { Firebase } from "~/api/Firebase";

type MicrosoftUserCredential = {
  _tokenResponse: {
    oauthAccessToken: string;
    rawUserInfo: string;
  };
} & UserCredential;

export class AuthenticationService {
  private readonly _app: FirebaseApp;
  private readonly _auth: Auth;
  private readonly _fb: Firebase;
  private readonly supported3rdPartyProviderIds: string[];
  constructor(fb: Firebase) {
    this._fb = fb;
    this._app = fb.app;
    this._auth = getAuth(this._app);
    if (!this._auth) {
      throw new Error("Firebase Authentication cannot be initialized");
    }

    this.supported3rdPartyProviderIds = [
      "microsoft.com",
      "github.com",
      "google.com",
    ];
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

  async signOut() {
    return await this._auth.signOut();
  }

  async signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this._auth, email, password);
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  async signInWithMicrosoft() {
    const provider = new OAuthProvider("microsoft.com");
    const userCred = await signInWithPopup(this.auth, provider);
    if (!userCred || !userCred.user) {
      throw new Error("Microsoft sign in failed.");
    }

    // Microsoft authentication does not return the photoURL
    // so we need to retrieve it manually by extra effort.
    const photoURL = userCred.user.photoURL;
    if (photoURL === null) {
      await this.tryToRetrieveProfilePhoto(userCred);
    }

    return userCred;
  }

  async signInWithGitHub() {
    const provider = new GithubAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  async updateProfile(name: string, profileImage: string) {
    if (!this.user) {
      throw new Error("User is not logged in");
    }

    // Upload the profile photo
    profileImage = await this._fb.uploadImage(
      `profile/${name}`,
      profileImage,
      false,
    );

    // Check if the profile photo is uploaded successfully
    if (
      profileImage &&
      profileImage.startsWith("https") &&
      name !== this.user.displayName
    ) {
      // Remove previous profile photo
      await this._fb.deleteImage(this.user.photoURL as string);
    }

    // Update the profile input
    const updateData: { displayName?: string; photoURL?: string } = {};
    if (name !== this.user.displayName) updateData.displayName = name;

    if (
      profileImage &&
      profileImage.startsWith("https") &&
      profileImage !== this.user.photoURL
    ) {
      updateData.photoURL = profileImage;
    }

    if (Object.keys(updateData).length === 0) {
      return;
    }

    return await updateProfile(this.user, updateData);
  }

  async verifyEmail() {
    if (!this.user) {
      throw new Error("User is not logged in");
    }

    return await sendEmailVerification(this.user);
  }

  isUserVerified() {
    if (!this.user) {
      return false;
    }

    if (this.user.emailVerified) {
      return true;
    }

    // Check provider data if any of them is a 3rd party provider
    for (const provider of this.user.providerData) {
      if (this.supported3rdPartyProviderIds.includes(provider.providerId)) {
        return true;
      }
    }

    return false;
  }

  private async retrievePhotoUrlForMicrosoft(uCred: UserCredential | any) {
    let userCredential: MicrosoftUserCredential = null!;

    if (uCred["_tokenResponse"] !== undefined) {
      userCredential = uCred as MicrosoftUserCredential;
    }

    if (!userCredential) return null;

    try {
      const oauthAccessToken = userCredential._tokenResponse.oauthAccessToken;

      const rawUserInfo = JSON.parse(
        userCredential._tokenResponse.rawUserInfo,
      ) as {
        userPrincipalName: string;
      };

      const userPrincipalName = rawUserInfo.userPrincipalName;
      const reqUrl = `https://graph.microsoft.com/v1.0/users/${userPrincipalName}/photo/$value`;
      const reqHeader = {
        headers: {
          Authorization: `Bearer ${oauthAccessToken}`,
          "Content-Type": "image/jpg",
        },
      };

      // make the request
      const response = await fetch(reqUrl, reqHeader);

      let base64Image: string | null = null;
      // if response is okay
      if (response.ok) {
        // read image from response as stream
        const imageBlob = await response.blob();

        // convert image to base64
        const reader = new FileReader();
        base64Image = (await reader.readAsyncAsDataURL(imageBlob)) as string;
      }

      return base64Image;
    } catch (e) {
      return null;
    }
  }

  private async tryToRetrieveProfilePhoto(userCred: UserCredential) {
    // Login successful, now retrieve the profile photo
    const profilePhotoBase64 =
      await this.retrievePhotoUrlForMicrosoft(userCred);

    if (profilePhotoBase64) {
      // Upload the profile with the retrieved photo
      await this.updateProfile(
        userCred.user.displayName as string,
        profilePhotoBase64,
      );
    } else {
      // Check whether the user has a photo uploaded before
      const possibleStoragePath = this._fb.generateStoragePath(
        `profile/${userCred.user.displayName as string}`,
        false,
      );

      const url = await this._fb.getDownloadURL(possibleStoragePath);

      if (url) {
        await updateProfile(userCred.user, {
          photoURL: url,
        });
      }
    }
  }
}
