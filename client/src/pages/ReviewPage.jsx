import React, { useState } from 'react';
import './css/ReviewPage.css';
import { useLanguage } from '../contexts/LanguageContext';

const ReviewPage = () => {
  const { language } = useLanguage();

  const [currentStage, setCurrentStage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    isAnonymous: false,
    rating: 5,
    comments: '',
    email: '',
    skipEmail: false
  });
  const [emailError, setEmailError] = useState('');

  const totalStages = 3;

  const ratingTooltips = {
    en: {
      1: "Terrible", 2: "Very Poor", 3: "Poor", 4: "Below Average", 5: "Average",
      6: "Above Average", 7: "Good", 8: "Very Good", 9: "Excellent", 10: "Outstanding"
    },
    fr: {
      1: "Terrible", 2: "Très mauvais", 3: "Mauvais", 4: "Insuffisant", 5: "Moyen",
      6: "Plutôt bon", 7: "Bon", 8: "Très bon", 9: "Excellent", 10: "Exceptionnel"
    }
  };

  const text = {
    en: {
      title: "Give Us",
      subtitle: "Feedback!", 
      progress: ["Name", "Review", "Contact"],
      stage1: {
        heading: "Tell us your name",
        sub: "We'd like to know who's sharing their feedback with us.",
        label: "Your Name",
        placeholder: "Enter your name",
        anonymous: "I prefer to remain anonymous",
        continue: "Continue"
      },
      stage2: {
        heading: "Rate your experience",
        sub: "How would you rate our site overall?",
        label: "Rating (1-10)",
        commentsLabel: "Your Comments",
        commentsPlaceholder: "Tell us about your experience...",
        back: "Back",
        continue: "Continue"
      },
      stage3: {
        heading: "Get a response",
        sub: "Would you like us to follow up on your review?",
        email: "Email Address",
        placeholder: "Enter your email",
        skip: "I don't want to be contacted",
        summaryTitle: "Review Summary",
        summary: {
          name: "Name",
          rating: "Rating",
          comments: "Comments",
          email: "Email"
        },
        submit: "Submit Review"
      },
      alertSuccess: "Thank you for your review! We appreciate your feedback.",
      alertError: "There was an error submitting your review. Please try again.",
      anonymous: "Anonymous",
      notProvided: "Not provided",
      emailInvalid: "Please enter a valid email address"
    },
    fr: {
      title: "Donnez Votre",
      subtitle: "Avis!",
      progress: ["Nom", "Avis", "Contact"],
      stage1: {
        heading: "Dites-nous votre nom",
        sub: "Nous aimerions savoir qui partage son avis avec nous.",
        label: "Votre nom",
        placeholder: "Entrez votre nom",
        anonymous: "Je préfère rester anonyme",
        continue: "Continuer"
      },
      stage2: {
        heading: "Évaluez votre expérience",
        sub: "Quelle note donneriez-vous à notre site ?",
        label: "Note (1-10)",
        commentsLabel: "Vos commentaires",
        commentsPlaceholder: "Parlez-nous de votre expérience...",
        back: "Retour",
        continue: "Continuer"
      },
      stage3: {
        heading: "Recevoir une réponse",
        sub: "Souhaitez-vous que nous vous répondions ?",
        email: "Adresse e-mail",
        placeholder: "Entrez votre e-mail",
        skip: "Je ne souhaite pas être contacté",
        summaryTitle: "Résumé de l'avis",
        summary: {
          name: "Nom",
          rating: "Note",
          comments: "Commentaires",
          email: "E-mail"
        },
        submit: "Soumettre l'avis"
      },
      alertSuccess: "Merci pour votre avis ! Nous apprécions vos retours.",
      alertError: "Une erreur est survenue. Veuillez réessayer.",
      anonymous: "Anonyme",
      notProvided: "Non fourni",
      emailInvalid: "Veuillez entrer une adresse e-mail valide"
    }
  };

  const t = text[language];
  const tooltip = ratingTooltips[language];

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear email error when user starts typing again
    if (field === 'email') {
      setEmailError('');
    }
  };

  const handleNext = () => {
    if (currentStage < totalStages) setCurrentStage(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStage > 1) setCurrentStage(prev => prev - 1);
  };

  const handleSubmit = async () => {
    // Validate email if not skipped
    if (!formData.skipEmail && formData.email.trim() && !isValidEmail(formData.email)) {
      setEmailError(t.emailInvalid);
      return;
    }

    try {
      console.log('Submitting review:', formData);
      alert(t.alertSuccess);
      setFormData({
        name: '',
        isAnonymous: false,
        rating: 5,
        comments: '',
        email: '',
        skipEmail: false
      });
      setEmailError('');
      setCurrentStage(1);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(t.alertError);
    }
  };

  const canProceedStage1 = formData.isAnonymous || formData.name.trim();
  const canProceedStage2 = formData.rating && formData.comments.trim();
  const canSubmit = formData.skipEmail || (formData.email.trim() && isValidEmail(formData.email));

  const renderProgressBar = () => (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${(currentStage / totalStages) * 100}%` }}
        ></div>
      </div>
      <div className="progress-labels">
        {t.progress.map((label, index) => (
          <span key={index} className={currentStage >= index + 1 ? 'active' : ''}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );

  const renderStage1 = () => (
    <div className="review-stage">
      <h2>{t.stage1.heading}</h2>
      <p>{t.stage1.sub}</p>
      <div className="form-group">
        <label htmlFor="name">{t.stage1.label}</label>
        <input
          id="name"
          type="text"
          placeholder={t.stage1.placeholder}
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          disabled={formData.isAnonymous}
          className={formData.isAnonymous ? 'disabled' : ''}
        />
      </div>
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.isAnonymous}
            onChange={(e) => {
              handleInputChange('isAnonymous', e.target.checked);
              if (e.target.checked) handleInputChange('name', '');
            }}
          />
          <span className="checkbox-text">{t.stage1.anonymous}</span>
        </label>
      </div>
      <div className="button-group">
        <button 
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!canProceedStage1}
        >
          {t.stage1.continue}
        </button>
      </div>
    </div>
  );

  const renderStage2 = () => (
    <div className="review-stage">
      <h2>{t.stage2.heading}</h2>
      <p>{t.stage2.sub}</p>
      <div className="form-group">
        <label>{t.stage2.label}</label>
        <div className="rating-container">
          <div className="rating-display">
            <div className="rating-value">{formData.rating}</div>
            <div className={`rating-tooltip ${formData.rating ? 'show' : ''}`}>
              {tooltip[formData.rating]}
            </div>
          </div>
          <div className="rating-slider-container">
            <input
              type="range"
              min="1"
              max="10"
              value={formData.rating}
              onChange={(e) => handleInputChange('rating', parseInt(e.target.value))}
              className="rating-slider"
            />
            <div className="rating-labels">
              {[...Array(10)].map((_, i) => <span key={i}>{i + 1}</span>)}
            </div>
          </div>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="comments">{t.stage2.commentsLabel}</label>
        <textarea
          id="comments"
          placeholder={t.stage2.commentsPlaceholder}
          value={formData.comments}
          onChange={(e) => handleInputChange('comments', e.target.value)}
          rows="4"
        ></textarea>
      </div>
      <div className="button-group">
        <button className="btn btn-secondary" onClick={handleBack}>
          {t.stage2.back}
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!canProceedStage2}
        >
          {t.stage2.continue}
        </button>
      </div>
    </div>
  );

  const renderStage3 = () => (
    <div className="review-stage">
      <h2>{t.stage3.heading}</h2>
      <p>{t.stage3.sub}</p>
      <div className="form-group">
        <label htmlFor="email">{t.stage3.email}</label>
        <input
          id="email"
          type="email"
          placeholder={t.stage3.placeholder}
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          disabled={formData.skipEmail}
          className={`${formData.skipEmail ? 'disabled' : ''} ${emailError ? 'error' : ''}`}
        />
        {emailError && <div className="error-message">{emailError}</div>}
      </div>
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.skipEmail}
            onChange={(e) => {
              handleInputChange('skipEmail', e.target.checked);
              if (e.target.checked) {
                handleInputChange('email', '');
                setEmailError('');
              }
            }}
          />
          <span className="checkbox-text">{t.stage3.skip}</span>
        </label>
      </div>
      <div className="review-summary">
        <h3>{t.stage3.summaryTitle}</h3>
        <div className="summary-item">
          <strong>{t.stage3.summary.name}:</strong>
          <span>{formData.isAnonymous ? t.anonymous : formData.name || t.notProvided}</span>
        </div>
        <div className="summary-item">
          <strong>{t.stage3.summary.rating}:</strong>
          <span>{formData.rating}/10 - {tooltip[formData.rating]}</span>
        </div>
        <div className="summary-item">
          <strong>{t.stage3.summary.comments}:</strong>
          <span>{formData.comments}</span>
        </div>
        <div className="summary-item">
          <strong>{t.stage3.summary.email}:</strong>
          <span>{formData.skipEmail ? t.notProvided : formData.email || t.notProvided}</span>
        </div>
      </div>
      <div className="button-group">
        <button className="btn btn-secondary" onClick={handleBack}>
          {t.stage2.back}
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {t.stage3.submit}
        </button>
      </div>
    </div>
  );

  return (
    <div className="review-page">
      <h2 className="review-title">
        <span className="review-icon">📝</span>
        {t.title} <span className="highlight">{t.subtitle}</span>
      </h2>
      <div className="review-container">
        {renderProgressBar()}
        <div className="review-content">
          {currentStage === 1 && renderStage1()}
          {currentStage === 2 && renderStage2()}
          {currentStage === 3 && renderStage3()}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;