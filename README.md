# MultivectorJS

This is a library to perform geometric algebra computations. As opposed to many other packages that have a lot of functionality for parsing mathematical expressions, simplifying equations or performing algebra on symbols, this library is only concerned with the computing aspects of geometric algebra.

I designed it to aid on the task of rotating N-dimension vectors because they are simpler to understand than huge matrices or tensors.

Currently it is only possible to create multivectors of up to dimension 256 because the underyling data structure is based on Uint8Array.

To extend the library one can simply run the tests `npm run test` and add extra features to the `Multivector` class.
