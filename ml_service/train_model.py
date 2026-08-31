import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

MODEL_PATH = 'model.pkl'
GENRES_PATH = 'genres.pkl'
DATA_PATH = 'historical_data.csv'

X_MIN, X_MAX = -8, 8
Y_MIN, Y_MAX = -15, 0

GENRES = [
    "Fiction & Literature",
    "Science & Technology",
    "history & Biography",
    "Business & Management",
    "Children & Young Adult",
    "Educational & Academic",
    "Arts & Design",
    "Comics & Graphic Novels",
    "Religion & Spirituality",
    "Travel & Lifestyle"
]

def generate_synthetic_data(n_samples=1000):
    """Generates synthetic historical data with spatial patterns."""
    print(f"Generating {n_samples} synthetic records...")
    
    data = []
    
    for _ in range(n_samples):
        x = np.random.uniform(X_MIN, X_MAX)
        y = np.random.uniform(Y_MIN, Y_MAX)
        size = np.random.choice(['SMALL', 'MEDIUM', 'LARGE'])
        
        # SPATIAL PATTERNS (The "Hidden Logic") 
        # 1. Entrance (0,0) -> Travel, Religion (Impulse buys / Welcoming)
        dist_entrance = np.sqrt(x**2 + y**2)
        
        # 2. Left Wing (-X) -> Children, Fiction (Browsing)
        # 3. Right Wing (+X) -> Business, Tech (Professional)
        # 4. Deep (-Y < -10) -> Academic, History (Quiet areas)
        
        probs = np.ones(len(GENRES)) # Base probability
        
        # Apply weights based on location
        if dist_entrance < 5:
            # Near entrance
            probs[GENRES.index("Travel & Lifestyle")] += 5
            probs[GENRES.index("Religion & Spirituality")] += 3
            probs[GENRES.index("Comics & Graphic Novels")] += 2
            
        if x < -2:
            # Left side
            probs[GENRES.index("Children & Young Adult")] += 4
            probs[GENRES.index("Fiction & Literature")] += 4
        
        if x > 2:
            # Right side
            probs[GENRES.index("Business & Management")] += 4
            probs[GENRES.index("Science & Technology")] += 4
            
        if y < -10:
            # Deep back
            probs[GENRES.index("Educational & Academic")] += 5
            probs[GENRES.index("history & Biography")] += 4
            
        # Normalize probabilities
        probs = probs / probs.sum()
        
        # Select genre based on calculated probability (simulating successful booking)
        selected_genre = np.random.choice(GENRES, p=probs)
        
        # Performance label (target)
        # In this synthetic setup, we assume the successful booking IS the "better" performance signal.
        # In real data, we would filter for performance='better' or use it as sample weight.
        # Here we just treat generated points as "good" examples to learn from.
        
        data.append({
            'x': x,
            'y': y,
            'stall_size': size,
            'genre': selected_genre
        })
        
    return pd.DataFrame(data)

def train():
    # 1. Load Data
    if os.path.exists(DATA_PATH):
        print(f"Loading data from {DATA_PATH}...")
        try:
            df = pd.read_csv(DATA_PATH)
            # Ensure columns exist
            required_cols = ['x', 'y', 'stall_size', 'genre', 'performance']
            if not all(col in df.columns for col in required_cols):
                print(f"Error: CSV missing columns. Found: {df.columns}")
                return

            # Filter for positive performance
            # The prompt said performance is "better" or "non-better"
            original_len = len(df)
            df = df[df['performance'].str.lower() == 'better']
            print(f"Filtered {original_len} -> {len(df)} records with 'better' performance.")
            
        except Exception as e:
            print(f"Error reading CSV: {e}")
            return
    else:
        print("Historical data not found. Please upload 'historical_data.csv'.")
        return

    # 2. Feature Engineering
    # Input features: x, y, stall_size
    # Target: genre
    
    # Encode categorical 'stall_size'
    # Simple mapping: SMALL=1, MEDIUM=2, LARGE=3 (Handling variations like 'S', 'Small')
    size_map = {
        'SMALL': 1, 'S': 1,
        'MEDIUM': 2, 'M': 2,
        'LARGE': 3, 'L': 3
    }
    df['size_encoded'] = df['stall_size'].str.upper().map(size_map).fillna(1) # Default to small if unknown
    
    # Engineered features
    df['dist_entrance'] = np.sqrt(df['x']**2 + df['y']**2)
    
    X = df[['x', 'y', 'size_encoded', 'dist_entrance']]
    y = df['genre']
    
    # 3. Train Model
    print("Training Random Forest Classifier...")
    # Using larger test split for validation since we have 10k records
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    clf = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42)
    clf.fit(X_train, y_train)
    
    # 4. Evaluate
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {acc:.4f}")
    # print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    # 5. Save Artifacts
    print(f"Saving model to {MODEL_PATH}...")
    joblib.dump(clf, MODEL_PATH)
    joblib.dump(GENRES, GENRES_PATH) # Verify if we should use unique genres from data instead?
    
    # Better to save unique genres found in data to ensure consistency
    unique_genres = sorted(y.unique().tolist())
    joblib.dump(unique_genres, GENRES_PATH)
    print(f"Saved {len(unique_genres)} genres: {unique_genres}")
    print("Done!")

if __name__ == "__main__":
    train()
