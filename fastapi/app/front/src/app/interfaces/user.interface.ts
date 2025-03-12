import { DocumentReference } from "@angular/fire/firestore";

export default interface User {
  name: string,
  uid: string,
  granjas: DocumentReference[],
  role: string
}
