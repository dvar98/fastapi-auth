import { Injectable } from '@angular/core';
import { DocumentReference, Firestore, collection, deleteDoc, doc, getDoc, getDocs, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class GetDataFirebaseService {

  constructor(private firestore: Firestore) { }

  //Función que devuelve un documento por su path
  async getDocByPath(reference: string) {
    const userDataRef = doc(this.firestore, reference);
    return await this.getDocByReference(userDataRef);
  }

  //Función que devuelve un documento por su referencia
  async getDocByReference(ref: DocumentReference): Promise<any> {
    try {
      const docSnapshot = await getDoc(ref);
      if (docSnapshot.exists()) {
        return docSnapshot;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  //Función que devuelve un array con todos los documentos de una colección
  async getCollectionDocs(collectionPath: string): Promise<any[]> {
    const collectionRef = collection(this.firestore, collectionPath);
    const querySnapshot = await getDocs(collectionRef);
    const docs: any[] = [];
    querySnapshot.forEach((doc) => {
      docs.push(doc);
    });
    return docs;
  }

  // Función para crear un documento
  async createDoc(ref: string, data: any, id?: string): Promise<DocumentReference | null> {
    try {
      const collectionRef = await collection(this.firestore, ref);
      let docRef

      if (id) {
        docRef = doc(collectionRef, id.toString());
        await setDoc(docRef, data);
      } else {
        docRef = doc(collectionRef);
        await setDoc(docRef, data);
      }
      console.log('Documento creado');
      return docRef;
    }
    catch (error) {
      console.error(error);
      return null;
    }
  }

  async selectCreateDoc(ref: any, createIt: boolean) {
    try {
      const docSnapshot = await getDoc(ref);
      if (docSnapshot.exists()) {
        return true
      } else {
        if (createIt) {
          await setDoc(ref, {});
          return true;
        } else {
          return false;
        }
      }
    } catch (error) {
      console.error('Error al verificar/crear el documento:', error);
      alert(`Error al subir el archivo: ${error}`)
      return false;
    }
  }

  // Función para actualizar los campos de in dpocumento
  async updateDoc(refPath: string, data: any) {
    const ref = doc(this.firestore, refPath);
    try {
      await setDoc(ref, data, { merge: true });
      console.log('Documento actualizado');
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  // Función para eliminar un documento
  async deleteDoc(refPath: string): Promise<DocumentReference | null> {
    //eliminar las colecciones del documento.

    const ref = doc(this.firestore, refPath);
    try {
      await deleteDoc(ref);
      console.log('Documento eliminado');
      return ref;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // Función para obtener la referencia de un documento
  getDocRef(path: string): DocumentReference {
    return doc(this.firestore, path);
  }
}
