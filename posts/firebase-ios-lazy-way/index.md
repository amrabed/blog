---
title: "Adding Firebase to iOS Project — The Lazy Way"
description: "If you are not already using CocoaPods in your project, you should start by installing it using this command:"
slug: "firebase-ios-lazy-way"
date: "2020-09-19"
cover_image: "./cover.png"
canonical_url: "https://medium.com/capsulat/adding-firebase-to-ios-project-the-lazy-way-94e1a41d980e"
tags:
  - firebase
  - ios
  - cloud
  - swift
  - mobile-app-development
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

# Adding Firebase to iOS Project — The Lazy Way

### Adding Firebase to iOS Project — The Lazy Way

#### 3 steps to add Firebase to your SwiftUI iOS app

If you are not already using [CocoaPods](https://cocoapods.org) in your project, you should start by installing it using this command:

```
sudo gem install cocoapods
```

#### Step 1: Add Podfile and install pods

Create a new Podfile in your project directory, or update an existing one. Your file should look like this:

```
platform :ios, '14.0'
```
```
target 'MyCoolApp' do
```
```
use_frameworks!  # Required for Swift
```
```
pod 'Firebase/Auth'
```
```
pod 'Firebase/Firestore'
```
```
pod 'FirebaseFirestoreSwift'
```
```
# ... Any other pods you need
```
```
end
```

In this example, I am using the Firebase Authentication and Firestore pods, but you should use the [pods for the Firebase products](https://firebase.google.com/docs/ios/setup?#available-pods) relevant to your project.

Now, install pods:

```
pod install --repo-update
```

Open the .xcworkspace (not .xcodeproj) and build your project.

#### Step 2: Create the AppDelegate file

Create an AppDelegate.swift file, and include the following code:

<a href="https://medium.com/media/703eeea25f32d0dc6f807679d34a725b/href">https://medium.com/media/703eeea25f32d0dc6f807679d34a725b/href</a>

Now, add the following line to your App.swift file:

```
@UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
```

Your file should look like that:

<a href="https://medium.com/media/debce4c50304026810add2470a03b283/href">https://medium.com/media/debce4c50304026810add2470a03b283/href</a>

#### Step 3: Add the iOS app to the Firebase project

Go to the [Firebase console](https://console.firebase.google.com), and create a new project, or select an existing one. On the top of the project main page, click the iOS icon

![](cover.png)

Follow the instructions to add the app to your Firebase project and download the GoogleService-Info.plist config file. Add the downloaded file to your project. Also, remember to add it to your .gitignore file.

You will need the App bundle ID which you can get in Xcode from the .xcodeproj file under General → Identity → Bundle Identifier.

That is all you need to do to add Firebase to your Swift-based iOS app. In future posts, I will summarize how to integrate Firebase authentication and Firestore into your iOS app using SwiftUI.

#### References

* [Firebase Documentation](https://firebase.google.com/docs/ios/setup)
* [Firebase iOS Codelab](https://codelabs.developers.google.com/codelabs/firebase-ios-swift)
* [Adding CocoaPods to XCode Project](https://guides.cocoapods.org/using/using-cocoapods.html)

---

[Adding Firebase to iOS Project — The Lazy Way](https://medium.com/capsulat/adding-firebase-to-ios-project-the-lazy-way-94e1a41d980e) was originally published in [Capsulat](https://medium.com/capsulat) on Medium, where people are continuing the conversation by highlighting and responding to this story.
