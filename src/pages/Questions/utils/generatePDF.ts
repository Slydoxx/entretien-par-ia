
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type PDFData = {
  question: string;
  answer: string;
  feedback: string;
  sampleResponse: string;
  job: string;
};

const generatePDF = async (data: PDFData) => {
  const { question, answer, feedback, sampleResponse, job } = data;
  
  // Create a temporary div to render the content
  const element = document.createElement("div");
  element.style.padding = "20px";
  element.style.position = "absolute";
  element.style.top = "-9999px";
  element.style.width = "595px"; // A4 width in pixels at 72 dpi
  element.style.fontFamily = "Arial, sans-serif";
  
  // Format the content
  element.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 10px;">Prepera - Entrainement d'entretien</h1>
      <p style="color: #666; font-size: 16px;">Poste: ${job || 'Non spécifié'}</p>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 10px;">Question:</h2>
      <p style="font-size: 14px; margin-left: 10px;">${question}</p>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 10px;">Votre réponse:</h2>
      <p style="font-size: 14px; margin-left: 10px;">${answer.replace(/\n/g, '<br>')}</p>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 10px;">Feedback IA:</h2>
      <p style="font-size: 14px; margin-left: 10px;">${feedback.replace(/\n/g, '<br>')}</p>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 10px;">Exemple de réponse:</h2>
      <p style="font-size: 14px; margin-left: 10px;">${sampleResponse.replace(/\n/g, '<br>')}</p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
      <p>Document généré par Prepera - ${new Date().toLocaleDateString()}</p>
    </div>
  `;
  
  document.body.appendChild(element);
  
  try {
    // Create the PDF
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    
    let heightLeft = imgHeight;
    let position = 0;
    
    // First page
    pdf.addImage(imgData, 'JPEG', imgX, position, imgWidth * ratio, imgHeight * ratio);
    heightLeft -= pdfHeight;
    
    // Add more pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', imgX, position, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pdfHeight;
    }
    
    // Download the PDF
    pdf.save(`Prepera_Entretien_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
  } finally {
    // Clean up
    document.body.removeChild(element);
  }
};

export default generatePDF;
