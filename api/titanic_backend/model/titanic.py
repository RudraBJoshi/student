import numpy as np
from model.titanic_data import TitanicDataProcessor
from model.titanic_trainer import TitanicTrainer


class TitanicModel:
    """Singleton that serves Titanic survival predictions.

    Responsibilities:
      - Singleton lifecycle management
      - Running inference (predict)
      - Exposing feature importance (feature_weights)

    Data loading/cleaning → TitanicDataProcessor
    Model training        → TitanicTrainer
    """

    _instance = None

    def __init__(self):
        processor = TitanicDataProcessor()
        raw = processor.load()
        data = processor.clean(raw)

        trainer = TitanicTrainer()
        X = data[processor.features]
        y = data[TitanicDataProcessor.TARGET]
        self.model, self.dt = trainer.train(X, y)

        self._processor = processor
        self.features = processor.features

    @classmethod
    def get_instance(cls):
        """Return (or create) the singleton TitanicModel."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def predict(self, passenger):
        """Predict survival probability for a passenger dict.

        Args:
            passenger (dict): Keys: pclass, sex, age, sibsp, parch, fare,
                              embarked, alone, name (optional)

        Returns:
            dict: {'die': float, 'survive': float}
        """
        df = self._processor.encode_passenger(passenger)
        die, survive = np.squeeze(self.model.predict_proba(df[self.features]))
        return {'die': float(die), 'survive': float(survive)}

    def feature_weights(self):
        """Return decision-tree feature importances.

        Returns:
            dict: {feature_name: importance_float}
        """
        return {feat: float(imp) for feat, imp in zip(self.features, self.dt.feature_importances_)}


def initTitanic():
    """Pre-load the Titanic model into memory at app startup."""
    TitanicModel.get_instance()


if __name__ == '__main__':
    model = TitanicModel.get_instance()
    test_passenger = {
        'name': 'Test Passenger',
        'pclass': 2,
        'sex': 'female',
        'age': 30,
        'sibsp': 0,
        'parch': 0,
        'fare': 16.0,
        'embarked': 'S',
        'alone': True,
    }
    result = model.predict(test_passenger)
    print(f"Die: {result['die']:.2%}  Survive: {result['survive']:.2%}")
    print("Feature weights:")
    for feat, weight in model.feature_weights().items():
        print(f"  {feat}: {weight:.2%}")
