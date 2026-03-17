import pandas as pd
import seaborn as sns
from sklearn.preprocessing import OneHotEncoder


class TitanicDataProcessor:
    """Responsible for loading and cleaning the Titanic dataset."""

    BASE_FEATURES = ['pclass', 'sex', 'age', 'sibsp', 'parch', 'fare', 'alone']
    TARGET = 'survived'
    DROP_COLS = ['alive', 'who', 'adult_male', 'class', 'embark_town', 'deck']

    def __init__(self):
        self.encoder = OneHotEncoder(handle_unknown='ignore')
        self.features = list(self.BASE_FEATURES)

    def load(self):
        """Load raw Titanic dataset from seaborn."""
        return sns.load_dataset('titanic')

    def clean(self, df):
        """Clean and encode the dataset.

        Args:
            df (pd.DataFrame): Raw Titanic dataset.

        Returns:
            pd.DataFrame: Cleaned and encoded dataset ready for training.
        """
        df = df.drop(columns=self.DROP_COLS)
        df['sex'] = df['sex'].apply(lambda x: 1 if x == 'male' else 0)
        df['alone'] = df['alone'].apply(lambda x: 1 if x is True else 0)
        df = df.dropna(subset=['embarked'])

        onehot = self.encoder.fit_transform(df[['embarked']]).toarray()
        cols = ['embarked_' + str(val) for val in self.encoder.categories_[0]]
        onehot_df = pd.DataFrame(onehot, columns=cols, index=df.index)
        df = pd.concat([df, onehot_df], axis=1)
        df = df.drop(columns=['embarked'])
        self.features = list(self.BASE_FEATURES) + cols

        return df.dropna()

    def encode_passenger(self, passenger):
        """Encode a single passenger dict for inference.

        Args:
            passenger (dict): Raw passenger fields.

        Returns:
            pd.DataFrame: Single-row DataFrame ready for model input.
        """
        df = pd.DataFrame(passenger, index=[0])
        df['sex'] = df['sex'].apply(lambda x: 1 if x == 'male' else 0)
        df['alone'] = df['alone'].apply(lambda x: 1 if x is True else 0)

        onehot = self.encoder.transform(df[['embarked']]).toarray()
        cols = ['embarked_' + str(val) for val in self.encoder.categories_[0]]
        onehot_df = pd.DataFrame(onehot, columns=cols)
        df = pd.concat([df, onehot_df], axis=1)
        df = df.drop(columns=['embarked', 'name'], errors='ignore')
        return df
