//taken from https://gist.github.com/bluesmoon/7925696

var spareRandom = null;

function normalRandom(seed)
{
	let rng = new Math.seedrandom(seed);
	var val, u, v, s, mul;

	if(spareRandom !== null)
	{
		val = spareRandom;
		spareRandom = null;
	}
	else
	{
		do
		{
			u = rng()*2-1;
			v = rng()*2-1;

			s = u*u+v*v;
		} while(s === 0 || s >= 1);

		mul = Math.sqrt(-2 * Math.log(s) / s);

		val = u * mul;
		spareRandom = v * mul;
	}

	return val;
}

function normalRandomInRange(min, max, seed)
{
	var val;
	do
	{
		val = normalRandom(seed);
	} while(val < min || val > max);

	return val;
}

function normalRandomScaled(mean, stddev, seed)
{
	var r = normalRandom(seed);

	r = r * stddev + mean;

	return Math.round(r);
}

function lnRandomScaled(gmean, gstddev, seed)
{
	var r = normalRandom(seed);

	r = r * Math.log(gstddev) + Math.log(gmean);

	return Math.round(Math.exp(r));
}
