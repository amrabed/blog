---
title: "Your AI Code Can Be Elegant Too"
description: "As the Machine Learning Engineering Manager at an AI-powered SaaS company, I get to peek into the machine learning (ML) code written by data scientists on the team. Oh, and when I’m not doing that, I dabble in the occasional Kaggle competition — although I must admit, I’m more of a casual competitor than a podium contender."
slug: "elegant-ai-code"
date: "2024-05-19"
cover_image: "./cover.png"
canonical_url: "https://amrabed.medium.com/your-ai-code-can-be-elegant-too-5aaed8b46e43"
tags:
  - data-science
  - machine-learning
  - mlops
  - artificial-intelligence
  - software-engineering
platforms:
  devto:
    published: false
    id: null
    url: null
  hashnode:
    published: false
    id: null
    url: null
---

# Your AI Code Can Be Elegant Too

#### An Engineer’s Take on Data Science Code

![](cover.png)
*Photo by [Chris Ried](https://unsplash.com/@cdr6934?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)*

As the Machine Learning Engineering Manager at an AI-powered SaaS company, I get to peek into the machine learning (ML) code written by data scientists on the team. Oh, and when I’m not doing that, I dabble in the occasional Kaggle competition — although I must admit, I’m more of a casual competitor than a podium contender.

Unfortunately, many data scientists didn’t cut their teeth on coding. Instead, they often come from mathematical or statistical backgrounds, where Python is adopted as an upgrade from R. Some might have an engineering background, but not necessarily in computer science or software engineering. It’s no wonder then that even the brightest minds winning top places in Kaggle competitions sometimes produce effective code yet about as elegant as a spork.

### Why do I Care?

My coding journey began as a Computer Engineering student at one of the top universities in Egypt back in 2003. I was lucky enough to start with C++ (not C), which naturally inclined me towards a clean, object-oriented programming (OOP) style.

Fast forward to my grad school days at Virginia Tech (2014–2017), I delved into the realms of machine learning and deep learning, tinkering with Pandas and TensorFlow (yes, even versions 0.12 and 1.0— Google, I’ll take that apology now)

Coming from such a background, I’ve always had a soft spot for clean code. For me, writing clean code has always been like a piece of art that I proudly sign. I know it may sound like a cliché, but I do mean it. And yes, that includes my machine-learning code. At one point, I even took a stab at [rewriting DL4J](https://github.com/amrabed/DL4J) (Deep Learning for Java) in a more object-oriented manner.

### What Exactly is a Clean Code Anyway?

> *Clean code always looks like it was written by someone who cares   
> ―* ***Robert Martin,*** [***Clean Code: A Handbook of Agile Software Craftsmanship***](https://www.goodreads.com/work/quotes/3779106)

When you write code, you are writing for an audience. This audience can be yourself in the future, your team, or both. Clean code ensures readability and maintainability for whoever needs to work with it next.

![](images/image_1.png)
**Image by* [*Glen Lipka*](https://commadot.com/about/) *on* [*Commadot*](https://commadot.com/wtf-per-minute) *(Inspired by* [*Thom Holwerda*](https://www.osnews.com/story/author/thom-holwerda)*’s post on*[*OSNews*](https://www.osnews.com/story/19266/wtfsm)*)**

Clean code becomes more crucial when used in today’s machine learning production platforms like MLFlow, TFX, and Sagemaker, where poorly written code can have significant consequences if it ends up in a production system.

Now, I won’t delve into the nitty-gritty of writing clean code here — there are many resources for that. If you’re keen to dive deeper, I recommend books like [Clean Code](https://www.goodreads.com/book/show/3735293-clean-code) by Robert Martin and [The Pragmatic Programmer](https://www.goodreads.com/book/show/126520556-the-pragmatic-programmer) by David Thomas and Andrew Hunt. This post focuses on making machine learning code cleaner, more readable, and more enjoyable to maintain.

### General Guidelines

#### Learn your tools

Libraries like NumPy, Pandas, and TensorFlow are powerful enough to do magic with your data in a few lines of code. Always take the time to study the API references and guides to master your tools before trying to do some data gymnastics using for loops on Python lists.

#### Adhere to Python naming conventions

I know X is a matrix while y is a vector, but Python doesn’t care. From a Python point of view, both are variables. Variables in Python use snake\_case (lowercase with underscores) as per [PEP-8](https://peps.python.org/pep-0008/#function-and-variable-names) (the style guide for Python):

> *Variable names follow the same convention as function names.*

> *Function names should be lowercase, with words separated by underscores as necessary to improve readability.*

#### Give your variables descriptive names

Instead of using names likedf, x, y, train\_ds, val\_ds, and test\_ds, I prefer to call my variables what they are:

* df is the data
* x and y are the features and labels
* train\_ds, val\_ds, and test\_dsare the training\_data, validation\_data and test\_data respectively

#### Be Precise with your imports

Why import numpy if all I need is the mean function? And why import pandas when all I need is the read\_csv function? Instead, import only what you need.

For instance, if I am creating a Pandas DataFrame from a CSV file, instead of this:

```
import pandas as pddf = pd.read_csv(file)
```

I can be more surgical with my imports:

```
from pandas import DataFrame, read_csvdata: DataFrame = read_csv(file)
```

Clean, elegant, and to the point. So, dear data scientists, next time you’re crafting a Pandas data frame from your CSV data, embrace the simplicity.

Unless I am using functions with the same name from different libraries, e.g., load from json and load from pickle, I don’t need to import the whole package, and even then, I can do something like:

```
from json import load as load_jsonfrom pickle import load as load_pickle
```

#### Use an Integrated Development Environment (IDE)

While Databricks and Google Colab could be popular, they are not the best options for writing production-ready code. Did you know that [Visual Studio Code](https://code.visualstudio.com) supports Jupyter notebooks too? That means I can write my machine-learning code in a powerful IDE that also offers features like:

* Version control with GitHub
* Code formatting and linting with tools like [black](https://black.readthedocs.io/en/stable/), [isort](https://pycqa.github.io/isort), and [flake8](https://flake8.pycqa.org/en/latest/)
* Auto-completion with AI tools like [IntelliCode](https://marketplace.visualstudio.com/items?itemName=VisualStudioExptTeam.vscodeintellicode), [Gemini](https://marketplace.visualstudio.com/items?itemName=GoogleCloudTools.cloudcode), [Blackbox](https://marketplace.visualstudio.com/items?itemName=Blackboxapp.blackbox), and [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
* Integration with Google Cloud for running code on TPUs

### Example: Cats versus Dogs

Now, let’s use as an example this code snippet of a transfer learning example from the TensorFlow documentation (markdown cells and explanatory comments are omitted for clarity):

```
import numpy as npimport kerasfrom keras import layersimport tensorflow_datasets as tfdsimport matplotlib.pyplot as plttfds.disable_progress_bar()train_ds, validation_ds, test_ds = tfds.load(    "cats_vs_dogs",    # Reserve 10% for validation and 10% for test    split=["train[:40%]", "train[40%:50%]", "train[50%:60%]"],    as_supervised=True,  # Include labels)print(f"Number of training samples: {train_ds.cardinality()}")print(f"Number of validation samples: {validation_ds.cardinality()}")print(f"Number of test samples: {test_ds.cardinality()}")plt.figure(figsize=(10, 10))for i, (image, label) in enumerate(train_ds.take(9)):    ax = plt.subplot(3, 3, i + 1)    plt.imshow(image)    plt.title(int(label))    plt.axis("off")resize_fn = keras.layers.Resizing(150, 150)train_ds = train_ds.map(lambda x, y: (resize_fn(x), y))validation_ds = validation_ds.map(lambda x, y: (resize_fn(x), y))test_ds = test_ds.map(lambda x, y: (resize_fn(x), y))augmentation_layers = [    layers.RandomFlip("horizontal"),    layers.RandomRotation(0.1),]def data_augmentation(x):    for layer in augmentation_layers:        x = layer(x)    return xtrain_ds = train_ds.map(lambda x, y: (data_augmentation(x), y))from tensorflow import data as tf_databatch_size = 64train_ds = train_ds.batch(batch_size).prefetch(tf_data.AUTOTUNE).cache()validation_ds = validation_ds.batch(batch_size).prefetch(tf_data.AUTOTUNE).cache()test_ds = test_ds.batch(batch_size).prefetch(tf_data.AUTOTUNE).cache()for images, labels in train_ds.take(1):    plt.figure(figsize=(10, 10))    first_image = images[0]    for i in range(9):        ax = plt.subplot(3, 3, i + 1)        augmented_image = data_augmentation(np.expand_dims(first_image, 0))        plt.imshow(np.array(augmented_image[0]).astype("int32"))        plt.title(int(labels[0]))        plt.axis("off")base_model = keras.applications.Xception(    weights="imagenet",  # Load weights pre-trained on ImageNet.    input_shape=(150, 150, 3),    include_top=False,)  # Do not include the ImageNet classifier at the top.# Freeze the base_modelbase_model.trainable = Falseinputs = keras.Input(shape=(150, 150, 3))scale_layer = keras.layers.Rescaling(scale=1 / 127.5, offset=-1)x = scale_layer(inputs)x = base_model(x, training=False)x = keras.layers.GlobalAveragePooling2D()(x)x = keras.layers.Dropout(0.2)(x)  # Regularize with dropoutoutputs = keras.layers.Dense(1)(x)model = keras.Model(inputs, outputs)model.summary(show_trainable=True)model.compile(    optimizer=keras.optimizers.Adam(),    loss=keras.losses.BinaryCrossentropy(from_logits=True),    metrics=[keras.metrics.BinaryAccuracy()],)epochs = 2print("Fitting the top layer of the model")model.fit(train_ds, epochs=epochs, validation_data=validation_ds)base_model.trainable = Truemodel.summary(show_trainable=True)model.compile(    optimizer=keras.optimizers.Adam(1e-5),  # Low learning rate    loss=keras.losses.BinaryCrossentropy(from_logits=True),    metrics=[keras.metrics.BinaryAccuracy()],)epochs = 1print("Fitting the end-to-end model")model.fit(train_ds, epochs=epochs, validation_data=validation_ds)print("Test dataset evaluation")model.evaluate(test_ds)
```

Here are a few areas where we can clean up that code:

1. The code importsnumpy only to use expand\_dims and array
2. The code imports matplotlib.pyplot as plt, then uses only four functions of plt
3. The code imports layers from keras, yet only uses a few layers from it
4. That relaxed import results in a redundant keras.layers prefix for each used layer
5. The same goes for keras.optimizers, keras.losses, and keras.metrics
6. Variable names are train\_ds, validation\_ds, and test\_ds can be training\_data, validation\_data, and test\_data respectively
7. The batch\_size is a constant, yet defined as a variable
8. The epochs variable is not necessary, since it’s only used in one place
9. The code can be formatted (black) and imports can be sorted (isort)

Rewriting this code with only those minor improvements, here is how it looks like:

```
from keras import Modelfrom keras.applications import Xceptionfrom keras.layers import (    Input,    Dense,    Dropout,    GlobalAveragePooling2D,    RandomFlip,    RandomRotation,    Rescaling,    Resizing,)from keras.losses import BinaryCrossentropyfrom keras.metrics import BinaryAccuracyfrom keras.optimizers import Adamfrom matplotlib.pyplot import axis, figure, imshow, subplot, titlefrom numpy import array, expand_dimsfrom tensorflow.data import AUTOTUNEfrom tensorflow_datasets import disable_progress_bar, load# Load and split the datasetdisable_progress_bar()training_data, validation_data, test_data = load(    "cats_vs_dogs",    split=["train[:40%]", "train[40%:50%]", "train[50%:60%]"],    as_supervised=True,  # Include labels)print(f"Number of training samples: {training_data.cardinality()}")print(f"Number of validation samples: {validation_data.cardinality()}")print(f"Number of test samples: {test_data.cardinality()}")# Show training data samplesfigure(figsize=(10, 10))for i, (image, label) in enumerate(training_data.take(9)):    ax = subplot(3, 3, i + 1)    imshow(image)    title(int(label))    axis("off")# Resize images to 150x150resize = Resizing(150, 150)training_data = training_data.map(lambda x, y: (resize(x), y))validation_data = validation_data.map(lambda x, y: (resize(x), y))test_data = test_data.map(lambda x, y: (resize(x), y))# Augment training data using RandomFlip and RandomRotation layersaugmentation_layers = [RandomFlip("horizontal"), RandomRotation(0.1)]def data_augmentation(images):    for layer in augmentation_layers:        images = layer(images)    return imagestraining_data = training_data.map(lambda x, y: (data_augmentation(x), y))# Batch the dataBATCH_SIZE = 64training_data = training_data.batch(BATCH_SIZE).prefetch(AUTOTUNE).cache()validation_data = validation_data.batch(BATCH_SIZE).prefetch(AUTOTUNE).cache()test_data = test_data.batch(BATCH_SIZE).prefetch(AUTOTUNE).cache()# Show the first batchfor images, labels in training_data.take(1):    figure(figsize=(10, 10))    first_image = images[0]    for i in range(9):        ax = subplot(3, 3, i + 1)        augmented_image = data_augmentation(expand_dims(first_image, 0))        imshow(array(augmented_image[0]).astype("int32"))        title(int(labels[0]))        axis("off")# Prepare the base modelbase_model = Xception(    weights="imagenet",  # Load weights pre-trained on ImageNet    input_shape=(150, 150, 3),    include_top=False,  # Do not include the ImageNet classifier at the top)base_model.trainable = False  # Freeze the base model# Create a new model on top of the base modelinputs = Input(shape=(150, 150, 3), name="input")x = Rescaling(scale=1 / 127.5, offset=-1)(inputs)  # scale input from (0, 255) to (-1, 1)x = base_model(x, training=False)x = GlobalAveragePooling2D()(x)x = Dropout(0.2)(x)  # Regularize with dropoutoutputs = Dense(1)(x)model = Model(inputs, outputs)model.summary(show_trainable=True)     # Train the top layer of the modelmodel.compile(    optimizer=Adam(),    loss=BinaryCrossentropy(from_logits=True),    metrics=[BinaryAccuracy()],)model.fit(training_data, epochs=2, validation_data=validation_data)# Fine-tune the modelbase_model.trainable = True  # Unfreeze the base modelmodel.summary(show_trainable=True)model.compile(    optimizer=Adam(1e-5),  # Low learning rate    loss=BinaryCrossentropy(from_logits=True),    metrics=[BinaryAccuracy()],)model.fit(training_data, epochs=1, validation_data=validation_data)# Evaluate the model using test datamodel.evaluate(test_data)
```

In addition to code clarity, one can now look at the import block at the beginning to get a glance at what model is being trained for the problem at hand:

```
from keras import Modelfrom keras.applications import Xceptionfrom keras.layers import (    Input,    Dense,    Dropout,    GlobalAveragePooling2D,    RandomFlip,    RandomRotation,    Rescaling,)from keras.losses import BinaryCrossentropyfrom keras.metrics import BinaryAccuracyfrom keras.optimizers import Adam
```

That is a pre-trained Xception model with Input and Rescaling layers used for input scaling, and GlobalAveragePooling2D, Dropout, and Dense layers used for hidden and output layers on top of the pre-trained model. We also see that the data was augmented using RandomFlip and RandomRotation layers and the model was built using an Adam optimizer, BinaryCrossentropy loss function, and BinaryAccuracy metric.

Testing the updated code gives us the same results as before using a more human-readable and maintainable code. This code is ready to run in your Python/Jupyter environment. Try it yourself!

### Summary

Incorporating clean coding practices into machine learning projects enhances the code's quality and readability and contributes to more reliable and maintainable systems. Strive for clean, efficient, and elegant code in all your projects, whether small-scale experiments or large production systems. Your future self and your team will thank you.
