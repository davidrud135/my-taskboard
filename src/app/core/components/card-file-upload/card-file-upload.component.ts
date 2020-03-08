import { firestore } from 'firebase/app';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';

import { TaskboardService } from '../../taskboard.service';
import { CardAttachment } from './../../models/card-attachment.model';

@Component({
  selector: 'app-card-file-upload',
  templateUrl: './card-file-upload.component.html',
  styleUrls: ['./card-file-upload.component.scss'],
})
export class CardFileUploadComponent implements OnInit {
  @Output() uploaded = new EventEmitter<CardAttachment>();
  @Input() file: File;
  @Input() cardId: string;
  uploadTask: AngularFireUploadTask;
  uploadProgress: number = 0;

  constructor(
    private afStorage: AngularFireStorage,
    private taskboardService: TaskboardService,
  ) {}

  ngOnInit(): void {
    this.uploadFile();
  }

  uploadFile() {
    const fileStoragePath = `cards_attachments/${this.cardId}/${Date.now()}_${
      this.file.name
    }`;
    const fileStorageRef = this.afStorage.ref(fileStoragePath);
    this.uploadTask = this.afStorage.upload(fileStoragePath, this.file);
    this.uploadTask
      .percentageChanges()
      .subscribe(
        (progress: number) => (this.uploadProgress = Math.floor(progress)),
      );
    this.uploadTask
      .snapshotChanges()
      .pipe(
        finalize(async () => {
          const url = await fileStorageRef.getDownloadURL().toPromise();
          const { name, type, size } = this.file;
          const extension = name.split('.').pop();
          this.uploaded.emit({
            url,
            name,
            type,
            size,
            extension,
            attachedAt: firestore.Timestamp.now(),
          });
        }),
      )
      .subscribe();
  }
}
