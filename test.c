#include <stdio.h>

int main(int a)
{
	int a, b;
	a = 10 + (5*2);
	b = +5;
	b = a * 4;
	if (a < b){
		a = 10;
		b = 10;
	}
	else {
		a = 5;
		b = 10;
	}

	while (a < b) {
		a = a+b*b;
		b = b/5;
	}
	printf("%d\n", a+b);
	return 0;
}