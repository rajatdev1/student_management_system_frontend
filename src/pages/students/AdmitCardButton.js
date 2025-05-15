import React, { useState, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const AdmitCardButton = ({ student, classInfo }) => {
  const [openAdmitCard, setOpenAdmitCard] = useState(false);
  const [rollNumber, setRollNumber] = useState('');
  const [examName, setExamName] = useState('TERM-I SA-1 EXAM');
  const [examDate, setExamDate] = useState('29-Oct-2023');
  const [isGenerating, setIsGenerating] = useState(false);
  const admitCardRef = useRef();

  const handleOpenAdmitCard = () => {
    setOpenAdmitCard(true);
  };

  const handleCloseAdmitCard = () => {
    setOpenAdmitCard(false);
  };

  const handleDownloadPDF = async () => {
    if (!admitCardRef.current || !rollNumber) return;
    
    setIsGenerating(true);
    
    try {
      const admitCard = admitCardRef.current;
      const canvas = await html2canvas(admitCard, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`admit_card_${student.name}_${rollNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<PictureAsPdfIcon />}
        onClick={handleOpenAdmitCard}
        sx={{ 
          py: 0.5, 
          px: 1, 
          fontSize: '0.75rem', 
          minWidth: 'auto' 
        }}
      >
        Generate
      </Button>

      <Dialog open={openAdmitCard} onClose={handleCloseAdmitCard} maxWidth="md" fullWidth>
        <DialogTitle>Generate Admit Card</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Roll Number"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              fullWidth
              margin="normal"
            />
            
            <TextField
              label="Exam Name"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              fullWidth
              margin="normal"
            />
            
            <TextField
              label="Exam Date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              fullWidth
              margin="normal"
            />
            
            <Box 
              ref={admitCardRef} 
              sx={{ 
                mt: 4, 
                p: 3, 
                border: '2px solid #000',
                backgroundColor: 'white'
              }}
            >
              <Box sx={{ display: 'flex', mb: 3 }}>
                <Box sx={{ width: '15%' }}>
                  <Box sx={{ 
                    width: 80, 
                    height: 80, 
                    border: '1px solid #ccc',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <img src="/school-logo.png" alt="School Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                  </Box>
                </Box>
                <Box sx={{ width: '70%', textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    DELHI PUBLIC SCHOOL
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    Run By: S.R. Edu & Social Welfare Trust
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    AT+PO: UKHAI, NEAR AAKODPUR, SIWAN-841227
                  </Typography>
                  <Box sx={{ 
                    border: '1px solid #000', 
                    width: '50%', 
                    mx: 'auto', 
                    mt: 1,
                    p: 0.5
                  }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Admit Card
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ width: '15%', display: 'flex', justifyContent: 'flex-end' }}>
                  <Box sx={{ 
                    width: 80, 
                    height: 100, 
                    border: '1px solid #000',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    bgcolor: '#f5f5f5'
                  }}>
                    {student.image_url ? (
                      <img 
                        src={student.image_url} 
                        alt="Student's Photo" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%', 
                          objectFit: 'cover' 
                        }} 
                      />
                    ) : (
                      <Typography variant="caption">Photo</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                <Box sx={{ width: '50%', display: 'flex', mb: 1 }}>
                  <Typography sx={{ fontWeight: 'bold', width: '40%' }}>Name of Student</Typography>
                  <Typography sx={{ ml: 1 }}>{student.name}</Typography>
                </Box>
                
                <Box sx={{ width: '50%', display: 'flex', mb: 1 }}>
                  <Typography sx={{ fontWeight: 'bold', width: '20%' }}>Class</Typography>
                  <Typography sx={{ ml: 1 }}>{classInfo.name}</Typography>
                  <Typography sx={{ fontWeight: 'bold', ml: 4, width: '20%' }}>Roll No.</Typography>
                  <Typography sx={{ ml: 1 }}>{rollNumber || '______'}</Typography>
                </Box>
                <Box sx={{ width: '50%', display: 'flex', mb: 1 }}>
                  <Typography sx={{ fontWeight: 'bold', width: '40%' }}>Mother's Name</Typography>
                  <Typography sx={{ ml: 1 }}>{student.mother_name}</Typography>
                </Box>
                <Box sx={{ width: '50%', display: 'flex', mb: 1 }}>
                  <Typography sx={{ fontWeight: 'bold', width: '40%' }}>Father's Name</Typography>
                  <Typography sx={{ ml: 1 }}>{student.father_name}</Typography>
                </Box>
                <Box sx={{ width: '100%', display: 'flex', mb: 1 }}>
                  <Typography sx={{ fontWeight: 'bold', width: '20%' }}>Contact No.</Typography>
                  <Typography sx={{ ml: 1 }}>{student.contact_number}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Typography sx={{ fontWeight: 'normal' }}>is allowed to appear in the</Typography>
                <Typography sx={{ mx: 1, fontWeight: 'bold', textDecoration: 'underline' }}>{examName}</Typography>
                <Typography sx={{ fontWeight: 'normal' }}>commencing from the date</Typography>
                <Typography sx={{ ml: 1, fontWeight: 'bold', textDecoration: 'underline' }}>{examDate}</Typography>
              </Box>
              
              <Typography sx={{ mb: 3, fontStyle: 'italic', fontSize: '0.9rem' }}>
                Note: Keep this card safely and must bring to the exam venue on every exam date.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8 }}>
                <Box sx={{ textAlign: 'center', width: '30%' }}>
                  <Typography sx={{ borderTop: '1px solid #000', pt: 1 }}>Principal</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', width: '30%' }}>
                  <Typography sx={{ borderTop: '1px solid #000', pt: 1 }}>School Seal</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', width: '30%' }}>
                  <Typography sx={{ borderTop: '1px solid #000', pt: 1 }}>Exam Controller</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdmitCard}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleDownloadPDF}
            disabled={!rollNumber || isGenerating}
            startIcon={<PictureAsPdfIcon />}
          >
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdmitCardButton;