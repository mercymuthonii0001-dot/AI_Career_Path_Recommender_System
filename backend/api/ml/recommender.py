from pathlib import Path

import joblib
import pandas as pd
from django.conf import settings
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MultiLabelBinarizer, OneHotEncoder
from sklearn.tree import DecisionTreeClassifier


MODEL_DIR = Path(settings.BASE_DIR) / "api" / "ml" / "trained"
MODEL_PATH = MODEL_DIR / "career_decision_tree.joblib"

CAREER_DETAILS = {
    "Software Engineer": {
        "description": "Designs, builds, tests, and maintains software applications and digital systems.",
        "required_skills": "Programming, Problem Solving, Analysis, Teamwork",
        "learning_resources": "Python Programming - https://www.freecodecamp.org/learn|Django Documentation - https://docs.djangoproject.com|Software Engineering Guide - https://roadmap.sh/software-design-architecture",
        "recommended_courses": "Intro to Python Programming|Full Stack Web Development with Django|Software Engineering Fundamentals",
    },
    "Data Scientist": {
        "description": "Uses data, statistics, and machine learning to discover insights and support decisions.",
        "required_skills": "Analysis, Programming, Problem Solving, Communication",
        "learning_resources": "Kaggle Learn - https://www.kaggle.com/learn|Scikit-learn Tutorials - https://scikit-learn.org/stable/tutorial/index.html|Data Science Roadmap - https://roadmap.sh/ai-data-scientist",
        "recommended_courses": "Python for Data Science|Statistics for Data Science|Machine Learning with Python",
    },
    "Cyber Security Analyst": {
        "description": "Protects systems, networks, and data from digital threats and security attacks.",
        "required_skills": "Problem Solving, Analysis, Programming, Communication",
        "learning_resources": "TryHackMe - https://tryhackme.com|Cisco Cybersecurity - https://skillsforall.com|OWASP - https://owasp.org",
        "recommended_courses": "Intro to Cybersecurity|Ethical Hacking Fundamentals|Network Security Essentials",
    },
    "Network Engineer": {
        "description": "Designs, configures, and maintains computer networks for organizations.",
        "required_skills": "Problem Solving, Analysis, Communication, Teamwork",
        "learning_resources": "Cisco Networking Basics - https://skillsforall.com|Network Engineering Roadmap - https://roadmap.sh/cyber-security|CompTIA Network+ - https://www.comptia.org",
        "recommended_courses": "Computer Networking Basics|Cisco CCNA Prep|Network Architecture Fundamentals",
    },
    "Teacher": {
        "description": "Educates learners, prepares lessons, assesses progress, and supports student growth.",
        "required_skills": "Communication, Leadership, Creativity, Teamwork",
        "learning_resources": "Teaching Resources - https://www.edutopia.org|Khan Academy - https://www.khanacademy.org|UNESCO Education - https://www.unesco.org/en/education",
        "recommended_courses": "Introduction to Teaching|Lesson Planning and Assessment|Educational Psychology",
    },
    "Doctor": {
        "description": "Diagnoses illnesses, treats patients, and promotes health and wellbeing.",
        "required_skills": "Communication, Problem Solving, Analysis, Leadership",
        "learning_resources": "Khan Academy Medicine - https://www.khanacademy.org/science/health-and-medicine|WHO Health Topics - https://www.who.int/health-topics|Coursera Health - https://www.coursera.org/browse/health",
        "recommended_courses": "Anatomy and Physiology|Medical Terminology|Healthcare Ethics",
    },
    "Nurse": {
        "description": "Provides patient care, monitors health, administers treatment, and supports recovery.",
        "required_skills": "Communication, Teamwork, Leadership, Problem Solving",
        "learning_resources": "Nursing Times - https://www.nursingtimes.net|WHO Nursing - https://www.who.int/health-topics/nursing|OpenWHO - https://openwho.org",
        "recommended_courses": "Foundations of Nursing|Patient Care Basics|Clinical Communication",
    },
    "Accountant": {
        "description": "Prepares financial records, analyzes accounts, and supports budgeting and compliance.",
        "required_skills": "Analysis, Communication, Problem Solving, Teamwork",
        "learning_resources": "Accounting Coach - https://www.accountingcoach.com|ACCA - https://www.accaglobal.com|Corporate Finance Institute - https://corporatefinanceinstitute.com",
        "recommended_courses": "Intro to Accounting|Financial Reporting|Business Math",
        "recommended_courses": "Intro to Accounting|Financial Reporting|Business Math",
    },
    "Banker": {
        "description": "Supports financial services including customer accounts, lending, and investment products.",
        "required_skills": "Communication, Analysis, Leadership, Teamwork",
        "learning_resources": "Khan Academy Finance - https://www.khanacademy.org/economics-finance-domain|Investopedia - https://www.investopedia.com|CFI Banking - https://corporatefinanceinstitute.com",
        "recommended_courses": "Fundamentals of Finance|Business Accounting|Banking and Investments",
    },
    "Civil Engineer": {
        "description": "Plans, designs, and supervises infrastructure such as roads, buildings, and water systems.",
        "required_skills": "Problem Solving, Analysis, Leadership, Teamwork",
        "learning_resources": "Civil Engineering Portal - https://www.engineeringcivil.com|MIT OpenCourseWare - https://ocw.mit.edu|Engineering Toolbox - https://www.engineeringtoolbox.com",
        "recommended_courses": "Intro to Civil Engineering|Structural Analysis|Construction Management",
    },
    "Mechanical Engineer": {
        "description": "Designs and improves machines, tools, engines, and mechanical systems.",
        "required_skills": "Problem Solving, Creativity, Analysis, Teamwork",
        "learning_resources": "MIT Mechanical Engineering - https://ocw.mit.edu|Engineering Toolbox - https://www.engineeringtoolbox.com|ASME - https://www.asme.org",
        "recommended_courses": "Mechanical Engineering Basics|Product Design|Materials Science",
    },
    "Entrepreneur": {
        "description": "Identifies opportunities, starts ventures, manages teams, and develops business solutions.",
        "required_skills": "Leadership, Creativity, Communication, Problem Solving",
        "learning_resources": "Y Combinator Startup Library - https://www.ycombinator.com/library|HubSpot Business - https://academy.hubspot.com|SBA Learning Center - https://www.sba.gov/learning-platform",
        "recommended_courses": "Startup Fundamentals|Business Planning|Marketing Strategy",
    },
    "Graphic Designer": {
        "description": "Creates visual designs for brands, products, campaigns, and digital experiences.",
        "required_skills": "Creativity, Communication, Teamwork, Analysis",
        "learning_resources": "Canva Design School - https://www.canva.com/designschool|Adobe Creative Cloud Tutorials - https://helpx.adobe.com/support.html|Interaction Design Foundation - https://www.interaction-design.org",
        "recommended_courses": "Graphic Design Fundamentals|Adobe Creative Suite|UX/UI Design Basics",
    },
    "Digital Marketer": {
        "description": "Plans and manages online campaigns using content, social media, search, and analytics.",
        "required_skills": "Communication, Creativity, Analysis, Leadership",
        "learning_resources": "Google Digital Garage - https://learndigital.withgoogle.com/digitalgarage|HubSpot Academy - https://academy.hubspot.com|Meta Blueprint - https://www.facebook.com/business/learn",
        "recommended_courses": "Digital Marketing Basics|Content Marketing|Social Media Strategy",
    },
}


TRAINING_DATA = [
    ("Computer Studies", "Technology", ["Programming", "Problem Solving"], "Software Engineer"),
    ("Mathematics", "Technology", ["Programming", "Analysis"], "Data Scientist"),
    ("Computer Studies", "Technology", ["Analysis", "Problem Solving"], "Cyber Security Analyst"),
    ("Physics", "Technology", ["Problem Solving", "Teamwork"], "Network Engineer"),
    ("English", "Education", ["Communication", "Leadership"], "Teacher"),
    ("History", "Education", ["Communication", "Creativity"], "Teacher"),
    ("Biology", "Healthcare", ["Analysis", "Communication"], "Doctor"),
    ("Chemistry", "Healthcare", ["Problem Solving", "Leadership"], "Doctor"),
    ("Biology", "Healthcare", ["Communication", "Teamwork"], "Nurse"),
    ("Business Studies", "Finance", ["Analysis", "Problem Solving"], "Accountant"),
    ("Mathematics", "Finance", ["Analysis", "Communication"], "Banker"),
    ("Physics", "Engineering", ["Problem Solving", "Analysis"], "Civil Engineer"),
    ("Mathematics", "Engineering", ["Creativity", "Problem Solving"], "Mechanical Engineer"),
    ("Business Studies", "Business", ["Leadership", "Creativity"], "Entrepreneur"),
    ("English", "Arts", ["Creativity", "Communication"], "Graphic Designer"),
    ("Business Studies", "Business", ["Communication", "Analysis"], "Digital Marketer"),
    ("Geography", "Agriculture", ["Analysis", "Teamwork"], "Civil Engineer"),
    ("Computer Studies", "Finance", ["Programming", "Analysis"], "Data Scientist"),
    ("Mathematics", "Business", ["Leadership", "Problem Solving"], "Entrepreneur"),
    ("English", "Business", ["Communication", "Creativity"], "Digital Marketer"),
    ("Physics", "Engineering", ["Creativity", "Analysis"], "Mechanical Engineer"),
    ("Chemistry", "Healthcare", ["Teamwork", "Communication"], "Nurse"),
    ("History", "Arts", ["Creativity", "Communication"], "Graphic Designer"),
    ("Geography", "Education", ["Communication", "Leadership"], "Teacher"),
    ("Computer Studies", "Technology", ["Programming", "Teamwork"], "Software Engineer"),
    ("Mathematics", "Technology", ["Analysis", "Problem Solving"], "Data Scientist"),
    ("Computer Studies", "Technology", ["Programming", "Analysis"], "Cyber Security Analyst"),
    ("Physics", "Technology", ["Analysis", "Communication"], "Network Engineer"),
]


def _training_frame():
    rows = [
        {
            "favourite_subject": subject,
            "interest_area": interest,
            "skills": skills,
            "career": career,
        }
        for subject, interest, skills, career in TRAINING_DATA
    ]
    return pd.DataFrame(rows)


class SkillsBinarizer(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.encoder = MultiLabelBinarizer()

    def fit(self, values, y=None):
        self.encoder.fit(values)
        return self

    def transform(self, values):
        return self.encoder.transform(values)

    def fit_transform(self, values, y=None):
        return self.encoder.fit_transform(values)

    def get_feature_names_out(self, input_features=None):
        return self.encoder.classes_


def train_model():
    data = _training_frame()
    x = data[["favourite_subject", "interest_area", "skills"]]
    y = data["career"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), ["favourite_subject", "interest_area"]),
            ("skills", SkillsBinarizer(), "skills"),
        ]
    )

    model = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", DecisionTreeClassifier(max_depth=7, random_state=42)),
        ]
    )
    model.fit(x, y)
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    return model


def load_model():
    if not MODEL_PATH.exists():
        return train_model()
    return joblib.load(MODEL_PATH)


def ensure_model_ready():
    try:
        if not MODEL_PATH.exists():
            train_model()
    except Exception:
        # Avoid breaking management commands before dependencies or migrations are ready.
        return None
    return MODEL_PATH


def predict_career(favourite_subject, interest_area, skills):
    model = load_model()
    sample = pd.DataFrame(
        [
            {
                "favourite_subject": favourite_subject,
                "interest_area": interest_area,
                "skills": skills,
            }
        ]
    )
    career = model.predict(sample)[0]
    confidence = 0.0
    if hasattr(model.named_steps["classifier"], "predict_proba"):
        probabilities = model.predict_proba(sample)[0]
        confidence = float(max(probabilities) * 100)
    return {
        "predicted_career": career,
        "confidence_score": round(confidence, 2),
        **CAREER_DETAILS[career],
    }
