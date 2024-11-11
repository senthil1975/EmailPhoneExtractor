import { Component, ViewChild } from '@angular/core';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  @ViewChild('fileInput') fileInput: any; // Reference to the file input
  parsedData: { email: string, phone: string }[] = [];
  textInput: string = ''; // Store textarea input

  // Handle file selection event and parse file without downloading
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.textInput = ''; // Clear the textarea when a file is selected
      this.parseFile(file);
    }
  }

  // Handle changes to textInput and reset the file input
  onTextInputChange() {
    if (this.textInput) {
      this.fileInput.nativeElement.value = ''; // Clear file input when textInput changes
    }
  }

  // Parse file content
  parseFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      this.extractEmailsAndPhones(text); // Parse file content, but do not download
    };
    reader.readAsText(file, 'UTF-8');
  }

  // Extract emails and phone numbers from text and filter duplicates
  extractEmailsAndPhones(text: string) {
    const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
    const phoneRegex = /\b[987]\d{9}\b/g;

    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex) || [];

    const uniqueEmails = new Set<string>();
    const uniquePhones = new Set<string>();

    this.parsedData = emails.map((email, index) => {
      const phone = phones[index] || '';
      const isUniqueEmail = !uniqueEmails.has(email);
      const isUniquePhone = !uniquePhones.has(phone);

      if (isUniqueEmail) uniqueEmails.add(email);
      if (isUniquePhone && phone) uniquePhones.add(phone);

      if (isUniqueEmail || isUniquePhone) {
        return { email, phone };
      }
      return null;
    }).filter((item) => item !== null) as { email: string, phone: string }[];
  }

  // Parse text input or previously uploaded file and trigger CSV download
  downloadCSV() {
    if (this.textInput.trim()) {
      this.extractEmailsAndPhones(this.textInput);
    }

    this.generateCSV();
  }

  // Convert parsed data to CSV and initiate download
  generateCSV() {
    const csvData = this.convertToCSV(this.parsedData);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'contacts.csv');
  }

  // Convert parsed data to CSV format
  convertToCSV(data: { email: string, phone: string }[]): string {
    const headers = 'Email,Phone\n';
    const rows = data.map(row => `${row.email},${row.phone}`).join('\n');
    return headers + rows;
  }
}
