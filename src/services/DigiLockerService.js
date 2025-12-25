// services/DigiLockerService.js

import { API_BASE_URL } from "../Config/API";

const CLIENT_ID = "CF1134840D52IN743AJJC738HCF6G";
const CLIENT_SECRET = "cfsk_ma_prod_dbfedf7ea6516d592b9c5538f716b561_34b0b176";

export const AADHAAR_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  AUTHENTICATED: 'AUTHENTICATED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  SUCCESS: 'SUCCESS'
};

class DigiLockerService {
  constructor() {
    this.baseURL = API_BASE_URL || 'https://scheme.bmgjewellers.com/api/v1';
  }

  /**
   * Create Aadhaar verification request
   */
  async createVerification(params) {
    try {
      console.log('Creating verification with params:', params);
      
      const headers = {
        'Content-Type': 'application/json',
        'x-client-id': CLIENT_ID,
        'x-client-secret': CLIENT_SECRET,
        'Accept': 'application/json',
      };
      
      const response = await fetch(`${this.baseURL}/digilocker/create-url`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          verification_id: params.verification_id,
          document_requested: ["AADHAAR"],
          redirect_url: "https://bmgjewellers.com",
          user_flow: params.user_flow || 'signup'
        })
      });

      const responseText = await response.text();
      console.log('Create UI Response:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      return {
        success: true,
        data: data,
        verificationUrl: data.url,
        referenceId: data.reference_id,
        status: data.status,
        verificationId: data.verification_id
      };
    } catch (error) {
      console.error('Create verification error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to initiate Aadhaar verification'
      };
    }
  }

  /**
   * Get verification status with improved polling
   */
  async getVerificationStatus(verificationId) {
    try {
      console.log('Getting status for verification ID:', verificationId);
      
      const headers = {
        'x-client-id': CLIENT_ID,
        'x-client-secret': CLIENT_SECRET,
        'Accept': 'application/json',
      };
      
      const response = await fetch(
        `${this.baseURL}/digilocker/status?verification_id=${verificationId}`,
        {
          method: 'GET',
          headers: headers
        }
      );

      const responseText = await response.text();
      console.log('Status Response Raw:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        throw new Error('Invalid JSON response from server');
      }
      
      // Check if we have actual user details (not null)
      const hasUserDetails = data.user_details && 
        (data.user_details.name !== null || 
         data.user_details.dob !== null || 
         data.user_details.gender !== null);

      console.log('Has user details:', hasUserDetails);
      console.log('User details:', data.user_details);
      
      // Extract user details if available
      let extractedData = null;
      if (hasUserDetails) {
        extractedData = {
          name: data.user_details.name,
          dob: data.user_details.dob,
          gender: data.user_details.gender,
          aadhaar: data.user_details.aadhaar,
          mobile: data.user_details.mobile,
          eaadhaar: data.user_details.eaadhaar
        };
      }

      return {
        success: true,
        status: data.status,
        verificationId: data.verification_id,
        referenceId: data.reference_id,
        documentRequested: data.document_requested,
        documentConsent: data.document_consent,
        documentConsentValidity: data.document_consent_validity,
        userDetails: extractedData,
        hasUserDetails: hasUserDetails,
        rawData: data
      };
    } catch (error) {
      console.error('Get status error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch verification status'
      };
    }
  }

  /**
   * Poll for verification status until completed
   */
  async pollVerificationStatus(verificationId, timeout = 60000, interval = 2000) {
    return new Promise(async (resolve, reject) => {
      const startTime = Date.now();
      
      const poll = async () => {
        try {
          const statusResult = await this.getVerificationStatus(verificationId);
          
          console.log('Polling result:', {
            status: statusResult.status,
            hasUserDetails: statusResult.hasUserDetails,
            userDetails: statusResult.userDetails
          });
          
          // Check if verification is complete
          if (statusResult.success) {
            // Success criteria: Either status is AUTHENTICATED/SUCCESS/APPROVED OR we have user details
            if (
              [AADHAAR_STATUS.AUTHENTICATED, AADHAAR_STATUS.SUCCESS, AADHAAR_STATUS.APPROVED].includes(statusResult.status) ||
              statusResult.hasUserDetails
            ) {
              console.log('Verification completed successfully');
              resolve(statusResult);
              return;
            }
            
            // Check for failure
            if ([AADHAAR_STATUS.REJECTED, AADHAAR_STATUS.FAILED, AADHAAR_STATUS.EXPIRED].includes(statusResult.status)) {
              console.log('Verification failed:', statusResult.status);
              resolve({
                ...statusResult,
                success: false,
                message: `Verification ${statusResult.status.toLowerCase()}`
              });
              return;
            }
            
            // Check timeout
            if (Date.now() - startTime > timeout) {
              console.log('Polling timeout reached');
              resolve({
                success: false,
                message: 'Verification timeout. Please try again.',
                status: 'TIMEOUT'
              });
              return;
            }
            
            // Continue polling
            console.log('Still pending, polling again in', interval, 'ms');
            setTimeout(poll, interval);
          } else {
            reject(statusResult);
          }
        } catch (error) {
          reject({
            success: false,
            error: error.message,
            message: 'Polling error'
          });
        }
      };
      
      // Start polling
      poll();
    });
  }

  /**
   * Get Aadhaar document data
   */
  async getAadhaarDocument(verificationId) {
    try {
      console.log('Getting Aadhaar document for verification ID:', verificationId);
      
      const headers = {
        'x-client-id': CLIENT_ID,
        'x-client-secret': CLIENT_SECRET,
        'Accept': 'application/json',
      };
      
      const response = await fetch(
        `${this.baseURL}/digilocker/document/AADHAAR?verification_id=${verificationId}`,
        {
          method: 'GET',
          headers: headers
        }
      );

      const responseText = await response.text();
      console.log('Document Response:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      return {
        success: true,
        status: data.status,
        verificationId: data.verification_id,
        referenceId: data.reference_id,
        uid: data.uid,
        message: data.message,
        photoLink: data.photo_link,
        xmlFile: data.xml_file,
        splitAddress: data.split_address,
        userDetails: {
          name: data.name,
          dob: data.dob,
          gender: data.gender,
          yearOfBirth: data.year_of_birth,
          careOf: data.care_of,
          uid: data.uid
        },
        rawData: data
      };
    } catch (error) {
      console.error('Get document error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch Aadhaar document'
      };
    }
  }

  /**
   * Check if URL contains verification completion indicators
   */
  isVerificationComplete(url) {
    // Check for completion patterns in URL
    const completionPatterns = [
      'success',
      'complete',
      'verified',
      'callback',
      'redirect',
      'status=success',
      'status=verified',
      'digilocker/status', // DigiLocker status page
      'verification.cashfree.com' // Cashfree verification URL
    ];
    
    return completionPatterns.some(pattern => 
      url.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Generate a unique verification ID
   */
  generateVerificationId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `VER_${timestamp}_${random}`;
  }

  /**
   * Format Aadhaar number
   */
  formatAadhaarNumber(aadhaar) {
    if (!aadhaar) return '';
    const digits = aadhaar.replace(/\D/g, '');
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  /**
   * Parse date from Aadhaar format (DD-MM-YYYY)
   */
  parseAadhaarDate(dob) {
    if (!dob || !dob.includes('-')) return dob;
    
    const parts = dob.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dob;
  }

  /**
   * Extract address from split address data
   */
  extractAddress(splitAddress) {
    if (!splitAddress) return null;
    
    return {
      doorNo: splitAddress.house || '',
      address1: splitAddress.street || '',
      address2: `${splitAddress.landmark || ''} ${splitAddress.vtc || ''}`.trim(),
      area: splitAddress.vtc || splitAddress.subdist || '',
      city: splitAddress.dist || splitAddress.subdist || '',
      state: splitAddress.state || '',
      pinCode: splitAddress.pincode || '',
      country: splitAddress.country || 'India'
    };
  }

  /**
   * Get status badge details
   */
  getStatusDetails(status) {
    const statusMap = {
      [AADHAAR_STATUS.PENDING]: {
        label: 'Pending',
        color: '#F59E0B',
        backgroundColor: '#FFFBEB',
        icon: '⏳',
        description: 'Waiting for user verification'
      },
      [AADHAAR_STATUS.AUTHENTICATED]: {
        label: 'Authenticated',
        color: '#10B981',
        backgroundColor: '#D1FAE5',
        icon: '✅',
        description: 'Aadhaar verified successfully'
      },
      [AADHAAR_STATUS.APPROVED]: {
        label: 'Approved',
        color: '#10B981',
        backgroundColor: '#D1FAE5',
        icon: '✅',
        description: 'Aadhaar approved'
      },
      [AADHAAR_STATUS.SUCCESS]: {
        label: 'Success',
        color: '#10B981',
        backgroundColor: '#D1FAE5',
        icon: '✅',
        description: 'Aadhaar verification successful'
      },
      [AADHAAR_STATUS.REJECTED]: {
        label: 'Rejected',
        color: '#EF4444',
        backgroundColor: '#FEE2E2',
        icon: '❌',
        description: 'Aadhaar verification rejected'
      },
      [AADHAAR_STATUS.FAILED]: {
        label: 'Failed',
        color: '#EF4444',
        backgroundColor: '#FEE2E2',
        icon: '⚠️',
        description: 'Verification process failed'
      },
      [AADHAAR_STATUS.EXPIRED]: {
        label: 'Expired',
        color: '#6B7280',
        backgroundColor: '#F3F4F6',
        icon: '⏰',
        description: 'Verification link expired'
      }
    };

    return statusMap[status] || {
      label: status || 'Unknown',
      color: '#6B7280',
      backgroundColor: '#F3F4F6',
      icon: '❓',
      description: 'Status unknown'
    };
  }

  /**
   * Auto-fill form data from Aadhaar verification
   */
  getFormDataFromAadhaar(aadhaarData) {
    const userDetails = aadhaarData.userDetails;
    const address = this.extractAddress(aadhaarData.splitAddress);
    
    return {
      pName: userDetails?.name || '',
      dob: this.parseAadhaarDate(userDetails?.dob) || '',
      gender: userDetails?.gender || '',
      mobile: userDetails?.mobile || '',
      idProofNo: this.formatAadhaarNumber(userDetails?.uid || aadhaarData.uid || ''),
      aadhaarVerified: true,
      aadhaarVerificationId: aadhaarData.verificationId,
      aadhaarStatus: aadhaarData.status,
      aadhaarVerifiedAt: new Date().toISOString(),
      // Address fields
      ...(address || {}),
      // Map care_of to nominee field
      nomeni: userDetails?.careOf || ''
    };
  }
}

// Export singleton instance
export const aadhaarService = new DigiLockerService();