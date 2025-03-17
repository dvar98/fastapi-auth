import { DocumentReference } from "@angular/fire/firestore";

export default interface User {
  email: string,
  name: string,
  id: string,
  roles: string[]
  granjas: string[]
}
