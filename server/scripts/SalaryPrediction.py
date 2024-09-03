import sys
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt
import json
import google.generativeai as genai
import warnings

warnings.filterwarnings("ignore")
#define gemini 
apikey = sys.argv[2]
genai.configure(api_key=apikey)
generation_config = {
    "temperature": 0.9,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
    }
safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    ]
model = genai.GenerativeModel(model_name="gemini-1.0-pro",
                              generation_config=generation_config,
                              safety_settings=safety_settings)
convo = model.start_chat(history=[])

#read the data of the mode
script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, 'Salary_Data.csv')
data = pd.read_csv(csv_path)

#change from USD to ILS
data['Salary'] = (data['Salary'] / 12 * 3.7).astype(int)
data['Years of Experience'] = data['Years of Experience'].astype(int)

X = data[['Education Level', 'Job Title', 'Years of Experience']]
y = data['Salary']
X = pd.get_dummies(X)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = LinearRegression()
model.fit(X_train, y_train)

#fuction to calaulate prediction to one job
def calculate_prediction(df):
    # Convert categorical variables to dummies
    df = pd.get_dummies(df)
    
    # Ensure that all columns from the training set are present in the DataFrame
    # Create a DataFrame with missing columns filled with 0
    df = df.reindex(columns=X_train.columns, fill_value=0)
    
    # Make predictions
    predicted_salary = model.predict(df)
    return predicted_salary[0].astype(int)

#function to create histogram for each prediction - how much I get in relation to others
def histogram(prediction, job):
    my_job_salary = data[data['Job Title'] == job]
    my_job_salary = my_job_salary['Salary']
    plt.hist(my_job_salary, bins=20, color='blue', alpha=0.7, label='Original Data')
    plt.axvline(x=prediction, color='red', linestyle='--', linewidth=2, label='Predicted Salary')
    plt.xlabel('Salary')
    plt.ylabel('Frequency')
    plt.title('People work as ' + job)
    plt.legend()
    plt.savefig(job + ' prediction.jpg')
    plt.close()

#read the data from the cv
try:
    new_person_json = sys.argv[1]
    new_person = json.loads(new_person_json)
except Exception as e:
    print(json.dumps({"error": f"Error loading input JSON: {str(e)}"}))
    sys.exit(1)

try:
    job_experience = json.loads(new_person['jobSelect'])
except Exception as e:
    print(json.dumps({"error": f"Error parsing jobSelect JSON: {str(e)}"}))
    sys.exit(1)

new_person_features = {
    'Education Level': new_person['latest_degree_earned'],
    'Job Title': list(job_experience.keys()),
    'Years of Experience': job_experience
}
new_person_df = pd.DataFrame([new_person_features])

if_continue = True
result = {
    "predictions": {},
    "issues": {}
}
jobTitles = ','.join(set(data['Job Title'].apply(str)))
job_counts = data['Job Title'].value_counts().to_frame().reset_index()

#missing value
if new_person_df.loc[0, 'Education Level'] is None or new_person_df.loc[0, 'Job Title'] is None or new_person_df.loc[0, 'Years of Experience'] is None:
    result["issues"]["general"] = "There's not enough information in the CV, can't calculate salary prediction"
    if_continue = False
else:
    new_person_df['Education Level'] = str(new_person_df['Education Level']).lower()
    degrees = "phd, bachelor's degree, master's degree, high school"
    # mismatch to the degrees values in the train
    if new_person_df.loc[0, 'Education Level'] not in degrees:
        convo.send_message("from this list: " + degrees + " please write the closest terminologic phrase to the given profession - "
                           + new_person_df.loc[0, 'Education Level']
                           + " if you can't find a match, return null")
        if convo.last.text == 'null':
            result["issues"]["general"] = "Can't find degree in the CV, can't calculate salary prediction"
            if_continue = False
        else:
            new_person_df.loc[0, 'Education Level'] = convo.last.text

    #check if can calaculate prediction to the given positions
    if if_continue:
        if isinstance(new_person_df.loc[0, 'Job Title'], list):
            new_person_df['Job Title'] = new_person_df['Job Title'].apply(lambda x: [title.lower() for title in x])
            pos = []
            for position in new_person_df.loc[0, 'Job Title']:
                if position not in jobTitles:
                    pos.append(position)
                elif job_counts[job_counts['Job Title'] == position]['count'].iloc[0] < 2:
                    pos.append(position)
            if len(pos) != 0:
                result["issues"]["insufficient_data"] = f"Can't calculate salary predictions for these positions: {', '.join(pos)}"
                new_person_df['Job Title'] = new_person_df['Job Title'].apply(lambda x: list(filter(lambda y: y not in pos, x)))
                if len(new_person_df.loc[0, 'Job Title']) == 0:
                    if_continue = False
        else: #only one position
            new_person_df['Job Title'] = new_person_df['Job Title'].lower()
            position = new_person_df.loc[0, 'Job Title']
            if position not in jobTitles or job_counts.loc[job_counts['Job Title'] == position, 'count'].iloc[0] < 2:
                result["issues"]["general"] = "Can't calculate salary prediction for this position"
                if_continue = False

        sum_experience = {title: 0 for title in new_person_df['Job Title'][0]}

#after checking all the given data - get the predicitons and histograms 
if if_continue:
    #list of positions
    if isinstance(new_person_df.loc[0, 'Job Title'], list):
        for job in new_person_df.loc[0, 'Job Title']:
            try:
                pos_df = pd.DataFrame(data={
                    'Education Level': new_person_df['Education Level'][0],
                    'Job Title': job,
                    'Years of Experience': sum_experience[job]}, index=[0])
                prediction = calculate_prediction(pos_df)
                result["predictions"][job] = str(prediction)
                histogram(prediction, job)
            except Exception as e:
                result["issues"][job] = str(e)
        
    else: #only one position
        prediction = calculate_prediction(new_person_df, new_person_df['Job Title'][0])
        result["predictions"][new_person_df['Job Title'][0]] = str(prediction)
        histogram(prediction, new_person_df['Job Title'][0])

if len(result["issues"]) > 0:
    result["general_issue"] = "Some issues occurred during prediction"

print(json.dumps(result))