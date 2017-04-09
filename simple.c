#include <stdio.h>

int main(int a)
{
	int a, b, c, d;
	a = 10 + (5*2);
	b = +5;
	b = a * 4 / c;
    a = a+1-b;
    c = b-a;
    a = c;
    d = a + b + c;
    if (a+b < c) {
        a = 1;
        b = a+1;
        a = b;
        c = a;
    }
    else {
        a = a + 1;
        if (b < c) {
            c = c - b;
            if (a >=c) {
                a = a-1;
            }
        }
        else {
            c = c + b;
        }
    }
    d = a + b + c;
	// return 0;
}