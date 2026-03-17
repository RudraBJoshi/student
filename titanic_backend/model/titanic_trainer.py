from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier


class TitanicTrainer:
    """Responsible for training Titanic survival prediction models."""

    def train(self, X, y):
        """Train a LogisticRegression and a DecisionTreeClassifier.

        Args:
            X (pd.DataFrame): Feature matrix.
            y (pd.Series): Target labels.

        Returns:
            tuple: (LogisticRegression, DecisionTreeClassifier)
        """
        lr = LogisticRegression(max_iter=1000)
        lr.fit(X, y)

        dt = DecisionTreeClassifier()
        dt.fit(X, y)

        return lr, dt
