type FirebaseErrorCode = string;
type MapValue = { message: string; title: string };

export const FirebaseErrorCodeMap = new Map<FirebaseErrorCode, MapValue>();

// Firebase Auth errors
FirebaseErrorCodeMap.set("auth/invalid-credential", {
  message: "Please check your E-mail and Password. Login information is wrong!",
  title: "Login failed",
});

FirebaseErrorCodeMap.set("auth/invalid-email", {
  message: "The email address is badly formatted.",
  title: "Sign up failed",
});

FirebaseErrorCodeMap.set("auth/email-already-in-use", {
  message: "The email address is already in use by another account.",
  title: "Sign up failed",
});

FirebaseErrorCodeMap.set("auth/weak-password", {
  message: "The password is too weak. It should be at least 6 characters.",
  title: "Sign up failed",
});

FirebaseErrorCodeMap.set("auth/user-not-found", {
  message:
    "There is no user record corresponding to this identifier. The user may have been deleted.",
  title: "Login failed",
});

FirebaseErrorCodeMap.set("auth/too-many-requests", {
  message:
    "Too many request has been made from this device. Please wait little bit more to let previous requests to be completed.",
  title: "Too many requests",
});

FirebaseErrorCodeMap.set("auth/user-cancelled", {
  message:
    "The user cancelled the operation. This usually happens when user refuses to grant permission",
  title: "Cancelled",
});

FirebaseErrorCodeMap.set("auth/popup-closed-by-user", {
  message:
    "The popup has been closed by the user before the operation was completed.",
  title: "Popup closed",
});

FirebaseErrorCodeMap.set("auth/account-exists-with-different-credential", {
  message:
    "An account already exists with the same email address but different sign-in credentials. Sign in using the correct provider associated with this email address.",
  title: "Account exists",
});

// Storage errors
FirebaseErrorCodeMap.set("storage/unauthorized", {
  message: "User doesn't have permission to access the object",
  title: "Unauthorized",
});

FirebaseErrorCodeMap.set("storage/retry-limit-exceeded", {
  message: "The operation retry limit has been exceeded.",
  title: "Retry limit exceeded",
});

FirebaseErrorCodeMap.set("storage/invalid-checksum", {
  message:
    "The uploaded file has an invalid checksum. This happens when the file is corrupted during the upload process. Please try again.",
  title: "Invalid checksum",
});

FirebaseErrorCodeMap.set("storage/canceled", {
  message: "The operation was canceled.",
  title: "Canceled",
});

FirebaseErrorCodeMap.set("storage/object-not-found", {
  message: "The image does not exist.",
  title: "Image not found",
});

FirebaseErrorCodeMap.set("storage/bucket-not-found", {
  message:
    "The storage bucket information is wrong. Please ask application admin to check storage settings.",
  title: "Bucket not found",
});

FirebaseErrorCodeMap.set("storage/project-not-found", {
  message:
    "The storage project information is wrong or the project has been deleted.",
  title: "Project not found",
});

FirebaseErrorCodeMap.set("storage/quota-exceeded", {
  message:
    "The operation could not be completed due to exceeding the storage quota.",
  title: "Quota exceeded",
});

FirebaseErrorCodeMap.set("storage/unauthenticated", {
  message: "User is unauthenticated for this operation.",
  title: "Unauthenticated",
});

FirebaseErrorCodeMap.set("storage/invalid-argument", {
  message: "The operation failed due to an invalid argument.",
  title: "Invalid argument",
});

FirebaseErrorCodeMap.set("storage/internal-error", {
  message: "The operation failed due to an internal error.",
  title: "Internal error",
});

FirebaseErrorCodeMap.set("storage/invalid-url", {
  message: "The operation failed, given URL is invalid.",
  title: "Invalid URL",
});

// Firestore errors

FirebaseErrorCodeMap.set("firestore/permission-denied", {
  message:
    "The operation was denied by the server. Please check your permissions.",
  title: "Permission denied",
});

FirebaseErrorCodeMap.set("firestore/aborted", {
  message: "The operation was aborted. Please try again.",
  title: "Aborted",
});

FirebaseErrorCodeMap.set("firestore/unavailable", {
  message: "The service is currently unavailable. Please try again later.",
  title: "Unavailable",
});

FirebaseErrorCodeMap.set("firestore/data-loss", {
  message: "Unrecoverable data loss or corruption. Please contact support.",
  title: "Data loss",
});
