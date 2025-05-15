import React, { useState, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const ResultCardButton = ({ student, classInfo }) => {
  const [openResultCard, setOpenResultCard] = useState(false);
  const [rollNumber, setRollNumber] = useState('');
  const [examName, setExamName] = useState('SUMMATIVE ASSESSMENT TEST-I');
  const [marks, setMarks] = useState({
    english: '',
    maths: '',
    hindi: '',
    socialStudies: '',
    science: '',
    gk: '',
    computer: ''
  });
  const [results, setResults] = useState({
    totalMarks: null,
    percentage: null,
    grade: null,
    remark: null,
    status: null
  });
  const [calculated, setCalculated] = useState(false);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const resultCardRef = useRef();

  const handleOpenResultCard = () => {
    setOpenResultCard(true);
    // Reset state when opening
    setMarks({
      english: '',
      maths: '',
      hindi: '',
      socialStudies: '',
      science: '',
      gk: '',
      computer: ''
    });
    setResults({
      totalMarks: null,
      percentage: null,
      grade: null,
      remark: null,
      status: null
    });
    setCalculated(false);
    setError(null);
  };

  const handleCloseResultCard = () => {
    setOpenResultCard(false);
  };

  const handleMarksChange = (subject, value) => {
    setMarks(prev => ({
      ...prev,
      [subject]: value
    }));
    setCalculated(false);
  };

  const calculateResults = () => {
    // Convert all marks to numbers
    const marksValues = {
      english: parseInt(marks.english) || 0,
      maths: parseInt(marks.maths) || 0,
      hindi: parseInt(marks.hindi) || 0,
      socialStudies: parseInt(marks.socialStudies) || 0,
      science: parseInt(marks.science) || 0,
      gk: parseInt(marks.gk) || 0,
      computer: parseInt(marks.computer) || 0
    };

    // Check if any marks are above 20
    const invalidMarks = Object.values(marksValues).some(mark => mark > 20);
    if (invalidMarks) {
      setError("Please enter correct marks (maximum 20 per subject)");
      return;
    }

    // Calculate total
    const total = Object.values(marksValues).reduce((sum, mark) => sum + mark, 0);
    const percentage = (total / 140) * 100;
    const percentageFixed = percentage.toFixed(2);

    // Determine pass/fail status
    const isPassing = Object.values(marksValues).every(mark => mark > 7);
    const status = isPassing ? "Pass" : "Fail";

    // Calculate grade based on percentage
    let grade = "";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 75) grade = "A";
    else if (percentage >= 60) grade = "B+";
    else if (percentage >= 50) grade = "B";
    else if (percentage >= 40) grade = "C";
    else if (percentage >= 35) grade = "D";
    else grade = "F";

    // Determine remark based on percentage
    let remark = "";
    if (percentage >= 90) remark = "Excellent";
    else if (percentage >= 75) remark = "Distinction";
    else if (percentage >= 60) remark = "Very Good";
    else if (percentage >= 50) remark = "Good But Satisfactory";
    else if (percentage >= 40) remark = "Keep hard work";
    else if (percentage >= 35) remark = "Need more hard work";
    else remark = "Need significant improvement";

    // Update results state
    setResults({
      totalMarks: total,
      percentage: percentageFixed,
      grade,
      remark,
      status
    });

    setCalculated(true);
    setError(null);
  };

  

  const handleDownloadPDF = async () => {
    if (!resultCardRef.current || !calculated || !rollNumber) return;
    
    setIsGenerating(true);
    
    try {
      const resultCard = resultCardRef.current;
      const canvas = await html2canvas(resultCard, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 20;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`result_card_${student.name}_${rollNumber}.pdf`);
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
        startIcon={<AssessmentIcon />}
        onClick={handleOpenResultCard}
        sx={{ 
          py: 0.5, 
          px: 1, 
          fontSize: '0.75rem', 
          minWidth: 'auto',
          ml: 1
        }}
      >
        Result
      </Button>

      <Dialog open={openResultCard} onClose={handleCloseResultCard} maxWidth="md" fullWidth>
        <DialogTitle>Generate Result Card</DialogTitle>
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
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box 
              ref={resultCardRef} 
              sx={{ 
                mt: 4, 
                p: 3, 
                border: '2px solid #000',
                backgroundColor: 'white'
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  DELHI PUBLIC SCHOOL
                </Typography>
                <Typography variant="h5" sx={{ mt: 1 }}>
                  {examName}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Typography sx={{ fontWeight: 'bold', width: '150px' }}>Student Name:</Typography>
                  <Typography>{student.name}</Typography>
                  
                  <Typography sx={{ fontWeight: 'bold', width: '150px', ml: 5 }}>Class:</Typography>
                  <Typography>{classInfo.name}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Typography sx={{ fontWeight: 'bold', width: '150px' }}>Father Name:</Typography>
                  <Typography>{student.father_name}</Typography>
                  
                  <Typography sx={{ fontWeight: 'bold', width: '150px', ml: 5 }}>Roll No:</Typography>
                  <Typography>{rollNumber || '______'}</Typography>
                </Box>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                  <Typography sx={{ fontWeight: 'bold', width: '150px' }}>Mother Name:</Typography>
                  <Typography>{student.mother_name}</Typography>
                  
                 
                </Box>
              </Box>
              
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Subjects</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Full Marks</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Marks Obtained</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>English</TableCell>
                      <TableCell>20</TableCell>
                      <TableCell>
                        {calculated ? marks.english : (
                          <TextField 
                            type="number" 
                            variant="standard" 
                            placeholder="Enter marks" 
                            value={marks.english}
                            onChange={(e) => handleMarksChange('english', e.target.value)}
                            InputProps={{ sx: { border: 'none' } }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Maths</TableCell>
                      <TableCell>20</TableCell>
                      <TableCell>
                        {calculated ? marks.maths : (
                          <TextField 
                            type="number" 
                            variant="standard" 
                            placeholder="Enter marks" 
                            value={marks.maths}
                            onChange={(e) => handleMarksChange('maths', e.target.value)}
                            InputProps={{ sx: { border: 'none' } }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Hindi</TableCell>
                      <TableCell>20</TableCell>
                      <TableCell>
                        {calculated ? marks.hindi : (
                          <TextField 
                            type="number" 
                            variant="standard" 
                            placeholder="Enter marks" 
                            value={marks.hindi}
                            onChange={(e) => handleMarksChange('hindi', e.target.value)}
                            InputProps={{ sx: { border: 'none' } }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Social Studies</TableCell>
                      <TableCell>20</TableCell>
                      <TableCell>
                        {calculated ? marks.socialStudies : (
                          <TextField 
                            type="number" 
                            variant="standard" 
                            placeholder="Enter marks" 
                            value={marks.socialStudies}
                            onChange={(e) => handleMarksChange('socialStudies', e.target.value)}
                            InputProps={{ sx: { border: 'none' } }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Science</TableCell>
                      <TableCell>20</TableCell>
                      <TableCell>
                        {calculated ? marks.science : (
                          <TextField 
                            type="number" 
                            variant="standard" 
                            placeholder="Enter marks" 
                            value={marks.science}
                            onChange={(e) => handleMarksChange('science', e.target.value)}
                            InputProps={{ sx: { border: 'none' } }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>GK</TableCell>
                      <TableCell>20</TableCell>
                      <TableCell>
                        {calculated ? marks.gk : (
                          <TextField 
                            type="number" 
                            variant="standard" 
                            placeholder="Enter marks" 
                            value={marks.gk}
                            onChange={(e) => handleMarksChange('gk', e.target.value)}
                            InputProps={{ sx: { border: 'none' } }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Computer</TableCell>
                      <TableCell>20</TableCell>
                      <TableCell>
                        {calculated ? marks.computer : (
                          <TextField 
                            type="number" 
                            variant="standard" 
                            placeholder="Enter marks" 
                            value={marks.computer}
                            onChange={(e) => handleMarksChange('computer', e.target.value)}
                            InputProps={{ sx: { border: 'none' } }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell>140</TableCell>
                      <TableCell>
                        {calculated ? results.totalMarks : ''}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Percentage Marks</TableCell>
                      <TableCell colSpan={2}>
                        {calculated ? `${results.percentage}%` : ''}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                      <TableCell colSpan={2}>
                        {calculated ? results.remark : ''}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                      <TableCell colSpan={2}>
                        {calculated ? results.grade : ''}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell colSpan={2}>
                        {calculated ? (
                          <Typography 
                            sx={{ 
                              color: results.status === 'Pass' ? '#027148' : 'red',
                              fontWeight: 'bold',
                              fontSize: '18px'
                            }}
                          >
                            {results.status}
                          </Typography>
                        ) : ''}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResultCard}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={calculateResults}
            disabled={calculated}
          >
            Calculate Results
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleDownloadPDF}
            disabled={!calculated || !rollNumber || isGenerating}
            startIcon={<PictureAsPdfIcon />}
          >
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ResultCardButton;