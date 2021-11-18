# Issues with Copying a P5Render Object

Hello Karl, this presentation of a problem is inspired by Pau's wonderful use of git branches!


## A Simple Max Patch and a Goal

In this repo, you will see a small max patch. This max patch uses a named `jit.matrix` to create a simple feedback loop based on an initial seed value. The only transformation applied is a rotation.

To use it, toggle `jit.world`, tap the `bang` labeled SEED, toggle the `qmetro`, and set `theta` to be some non-zero value. You can play with the resolution of the seed and the `theta` parameter to come up with some neat, streaky patterns. I reccomend using a `theta` below 0.01.

I would like to translate this sketch into a p5js sketch.

(This patch behaves unintuitvely and I fear hidden mechanisms. See the last section for details.)

## A Simple P5 Sketch
The rest of the repo houses a p5 sketch, utilizing shaders. The general gist of it follows the max patch. 

**NOTE**: Since this grabs shaders from the file system, you must run this sketch on a local server.

There are three p5.Render objects: 
1) screen : a webgl render object that runs the shader `distort.frag`
    - `distort.frag` contains the feedback chain with the rotation operation.
2) state : a render object that contains the previous state of `screen`.
    - Note: on initialization, this contains the seed.
3) main canvas: `screen` will be displayed to the **actual** screen here

## The Problem
The crux of getting this to work is having a stateful shader. 

This involves copying the output of `screen` into `state`. 

You can see this being attempted at the bottom of `sketch.js`. This does not work and there are no errors in sight. It's failure to copy is made apparent by the fact that after each bang, the rotation is not "remembered". In between each bang, the output is the initial state of `state`, instead of being the rotated image caused by the bang.

I don't really know what do about this. It should work, it works for images, but it doesn't work here.

## Some Research on the Problem

I believe the problem has to do with either copying a WEBGL-based `p5.Render` object into a 2D `p5.Render` object, or it is a bug with the `p5.Render` copying in general.

Here is github issue and pull request on the topic (supposedly this was fixed in 2019) :
- [issue](https://github.com/processing/p5.js/issues/3932)
- [pull request](https://github.com/processing/p5.js/pull/3936)


## Continued Thoughts on the Max Patch

The max patch is strange and even if we figure out this whole copying issue, I doubt the p5 sketch will mimic its behavior. 

On each metro bang, the patch is rotating the last state by some constant amount. In my mind, this should produce some steady rotating image, with some streaks on the ends, to accoount for boundary issues. However, all these strange "melt-y" patterns start happening. The intial grid of randomly colored squares start running into each other. And the rotation isn't smooth, especially at low values of theta (soomething to do with theta being float, and the matrix being a discrete grid)! Ok, maybe the discrete part can be explained, but the "melt-y" part is strange (and exactly why I am interested in porting this over to p5). I bet there are some hidden stuff happening in jit thay I will have to figure out. Any pointers?

Other note: this patch is a trimmed down verison of a slightly more complicated patch that creates much more interesting results. That's the next step once I get this step working.
