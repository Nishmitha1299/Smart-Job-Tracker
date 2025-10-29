// Import FontAwesome icons for location, email, and LinkedIn
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons'

// Import global styles
import '../App.css'

function Footer() {
    return (
        <footer className="footer">
            {/* Left section: branding and copyright */}
            <div className="footer-left">
              <h3>Smart Job Tracker</h3>
              <p style={{color:'white'}}>&copy; {new Date().getFullYear()} All rights reserved</p>
            </div>

            {/* Center section: legal links */}
            <div className="footer-center">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
            </div>

            {/* Right section: contact and social links */}
            <div className="footer-right" id='contact-us'>
              <h3>You Can Find Us</h3>

              {/* Location info with icon */}
              <h4 style={{color:'white', lineHeight:'5px'}} className='para-text'>
                <FontAwesomeIcon icon={faLocationDot} />Mumbai
              </h4>

              {/* Email link with icon */}
              <a href="mailto:contact@jobtracker.com">
                <FontAwesomeIcon icon={faEnvelope} />
              </a>

              {/* LinkedIn profile link with icon */}
              <a href='https://linkedin.com/in/nishmitha-naik-a23366188' target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>
            </div>
        </footer>
    )
}

export default Footer;