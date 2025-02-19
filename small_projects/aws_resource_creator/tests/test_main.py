import unittest


class TestMagic(unittest.TestCase):
    # def __init__(self):
    #     super().__init__()

    def test_failure(self):
        self.assertFalse(False)